<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    /**
     * Cache TTL in seconds (no cache for real-time reporting)
     */
    private const CACHE_TTL = 0;

    /**
     * GET /api/admin/analytics/event-comparison
     *
     * Compare revenue, tickets sold, refund rate across events.
     * Returns trend data per event.
     */
    public function getEventComparison(Request $request)
    {
        // No cache - always return real-time data for reporting
        $data = (function () use ($request) {

            // Base query: aggregate per event
            $query = DB::table('events')
                ->leftJoin('orders', 'events.event_id', '=', 'orders.event_id')
                ->leftJoin('order_items', 'orders.order_id', '=', 'order_items.order_id')
                ->leftJoin('ticket_types', 'events.event_id', '=', 'ticket_types.event_id')
                ->select(
                    'events.event_id',
                    'events.title',
                    'events.start_time',
                    'events.status',
                    DB::raw("COALESCE(SUM(CASE WHEN orders.status = 'paid' THEN orders.total_price ELSE 0 END), 0) as total_revenue"),
                    DB::raw("COALESCE(SUM(CASE WHEN orders.status = 'paid' THEN order_items.quantity ELSE 0 END), 0) as tickets_sold"),
                    DB::raw("COALESCE(SUM(CASE WHEN orders.status = 'canceled' THEN 1 ELSE 0 END), 0) as refund_count"),
                    DB::raw("COUNT(DISTINCT orders.order_id) as total_orders")
                )
                ->groupBy('events.event_id', 'events.title', 'events.start_time', 'events.status');

            // Optional: filter by specific event IDs
            if ($request->has('event_ids')) {
                $eventIds = explode(',', $request->input('event_ids'));
                $query->whereIn('events.event_id', $eventIds);
            }

            $events = $query->get();

            // Get total capacity per event from ticket_types
            $capacities = DB::table('ticket_types')
                ->select('event_id', DB::raw('SUM(available_stock) as total_capacity'))
                ->groupBy('event_id')
                ->pluck('total_capacity', 'event_id');

            // Compute trend data: monthly revenue per event (last 6 months)
            $trendData = DB::table('orders')
                ->join('events', 'orders.event_id', '=', 'events.event_id')
                ->where('orders.status', 'paid')
                ->where('orders.created_at', '>=', now()->subMonths(6))
                ->select(
                    'events.event_id',
                    DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as month"),
                    DB::raw('SUM(orders.total_price) as monthly_revenue'),
                    DB::raw('COUNT(orders.order_id) as monthly_orders')
                )
                ->groupBy('events.event_id', DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m')"))
                ->orderBy('month')
                ->get()
                ->groupBy('event_id');

            // Format response
            $result = $events->map(function ($event) use ($capacities, $trendData) {
                $capacity = $capacities[$event->event_id] ?? 0;
                $refundRate = $event->total_orders > 0
                    ? round(($event->refund_count / $event->total_orders) * 100, 2)
                    : 0;
                $occupancyRate = $capacity > 0
                    ? round(($event->tickets_sold / $capacity) * 100, 2)
                    : 0;

                return [
                    'event_id'       => $event->event_id,
                    'title'          => $event->title,
                    'start_time'     => $event->start_time,
                    'status'         => $event->status,
                    'total_revenue'  => (float) $event->total_revenue,
                    'tickets_sold'   => (int) $event->tickets_sold,
                    'total_capacity' => (int) $capacity,
                    'occupancy_rate' => $occupancyRate,
                    'refund_count'   => (int) $event->refund_count,
                    'total_orders'   => (int) $event->total_orders,
                    'refund_rate'    => $refundRate,
                    'trend'          => ($trendData[$event->event_id] ?? collect())->map(fn($t) => [
                        'month'           => $t->month,
                        'monthly_revenue' => (float) $t->monthly_revenue,
                        'monthly_orders'  => (int) $t->monthly_orders,
                    ])->values(),
                ];
            });

            return $result;
        })();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/admin/analytics/revenue
     *
     * Total revenue per event, daily revenue breakdown,
     * and payment method breakdown.
     */
    public function getRevenueAnalytics(Request $request)
    {
        // No cache - always return real-time data for reporting
        $data = (function () use ($request) {

            // --- 1) Revenue per event ---
            $revenuePerEvent = DB::table('orders')
                ->join('events', 'orders.event_id', '=', 'events.event_id')
                ->where('orders.status', 'paid')
                ->select(
                    'events.event_id',
                    'events.title',
                    DB::raw('SUM(orders.total_price) as total_revenue'),
                    DB::raw('COUNT(orders.order_id) as total_orders')
                )
                ->groupBy('events.event_id', 'events.title')
                ->orderByDesc('total_revenue')
                ->get();

            // --- 2) Daily revenue breakdown ---
            $dailyQuery = DB::table('orders')
                ->where('status', 'paid');

            // Optional date range filter
            if ($request->has('date_from')) {
                $dailyQuery->where('created_at', '>=', $request->input('date_from'));
            }
            if ($request->has('date_to')) {
                $dailyQuery->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
            }

            // Default: last 30 days if no filter
            if (!$request->has('date_from') && !$request->has('date_to')) {
                $dailyQuery->where('created_at', '>=', now()->subDays(30));
            }

            $dailyRevenue = (clone $dailyQuery)
                ->select(
                    DB::raw("DATE(created_at) as date"),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(order_id) as orders')
                )
                ->groupBy(DB::raw("DATE(created_at)"))
                ->orderBy('date')
                ->get();

            // --- 3) Payment method breakdown ---
            $paymentMethodBreakdown = DB::table('payments')
                ->join('orders', 'payments.order_id', '=', 'orders.order_id')
                ->where('payments.status', 'paid')
                ->select(
                    DB::raw("COALESCE(payments.payment_method, 'unknown') as method"),
                    DB::raw("COALESCE(payments.payment_gateway, 'unknown') as gateway"),
                    DB::raw('SUM(payments.amount) as total_amount'),
                    DB::raw('COUNT(payments.payment_id) as total_transactions')
                )
                ->groupBy('payments.payment_method', 'payments.payment_gateway')
                ->orderByDesc('total_amount')
                ->get();

            // --- Summary ---
            $totalRevenue = $revenuePerEvent->sum('total_revenue');
            $totalOrders = $revenuePerEvent->sum('total_orders');

            return [
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_orders'  => (int) $totalOrders,
                    'avg_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
                ],
                'revenue_per_event'      => $revenuePerEvent,
                'daily_revenue'          => $dailyRevenue,
                'payment_method_breakdown' => $paymentMethodBreakdown,
            ];
        })();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/admin/analytics/transactions
     *
     * Filtered transaction metrics by event + date range.
     * Returns aggregated count, sum, avg.
     */
    public function getTransactionMetrics(Request $request)
    {
        // No cache - always return real-time data for reporting
        $data = (function () use ($request) {

            $query = DB::table('orders')
                ->leftJoin('events', 'orders.event_id', '=', 'events.event_id')
                ->leftJoin('payments', 'orders.order_id', '=', 'payments.order_id');

            // Filter by event_id
            if ($request->has('event_id')) {
                $query->where('orders.event_id', $request->input('event_id'));
            }

            // Filter by date range
            if ($request->has('date_from')) {
                $query->where('orders.created_at', '>=', $request->input('date_from'));
            }
            if ($request->has('date_to')) {
                $query->where('orders.created_at', '<=', $request->input('date_to') . ' 23:59:59');
            }

            // Filter by order status
            if ($request->has('status')) {
                $query->where('orders.status', $request->input('status'));
            }

            // Aggregate metrics
            $aggregates = (clone $query)->select(
                DB::raw('COUNT(DISTINCT orders.order_id) as total_count'),
                DB::raw('COALESCE(SUM(orders.total_price), 0) as total_sum'),
                DB::raw('COALESCE(AVG(orders.total_price), 0) as total_avg'),
                DB::raw("SUM(CASE WHEN orders.status = 'paid' THEN orders.total_price ELSE 0 END) as paid_sum"),
                DB::raw("SUM(CASE WHEN orders.status = 'paid' THEN 1 ELSE 0 END) as paid_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'pending' THEN 1 ELSE 0 END) as pending_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'failed' THEN 1 ELSE 0 END) as failed_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'canceled' THEN 1 ELSE 0 END) as canceled_count")
            )->first();

            // Breakdown by status
            $statusBreakdown = (clone $query)
                ->select(
                    'orders.status',
                    DB::raw('COUNT(DISTINCT orders.order_id) as count'),
                    DB::raw('COALESCE(SUM(orders.total_price), 0) as total')
                )
                ->groupBy('orders.status')
                ->get();

            // Breakdown by event (if no specific event filter)
            $eventBreakdown = collect();
            if (!$request->has('event_id')) {
                $eventBreakdown = (clone $query)
                    ->select(
                        'events.event_id',
                        'events.title',
                        DB::raw('COUNT(DISTINCT orders.order_id) as count'),
                        DB::raw('COALESCE(SUM(orders.total_price), 0) as total'),
                        DB::raw('COALESCE(AVG(orders.total_price), 0) as avg')
                    )
                    ->whereNotNull('events.event_id')
                    ->groupBy('events.event_id', 'events.title')
                    ->orderByDesc('total')
                    ->get();
            }

            // Recent transactions (last 20)
            $recentTransactions = (clone $query)
                ->select(
                    'orders.order_id',
                    'orders.status',
                    'orders.total_price',
                    'orders.payment_method',
                    'orders.created_at',
                    'events.title as event_title',
                    'payments.payment_gateway',
                    'payments.payment_date'
                )
                ->orderByDesc('orders.created_at')
                ->limit(200)
                ->get();

            return [
                'aggregates'          => $aggregates,
                'status_breakdown'    => $statusBreakdown,
                'event_breakdown'     => $eventBreakdown,
                'recent_transactions' => $recentTransactions,
            ];
        })();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/organizer/analytics/event-comparison
     * Same as admin but filtered to organizer's assigned events only.
     */
    public function getOrganizerEventComparison(Request $request)
    {
        $user = auth()->user();
        $assignedEventIds = DB::table('event_organizers')
            ->where('organizer_id', $user->user_id)
            ->pluck('event_id')
            ->toArray();

        if (empty($assignedEventIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // Inject event_ids filter and delegate
        $request->merge(['event_ids' => implode(',', $assignedEventIds)]);
        return $this->getEventComparison($request);
    }

    /**
     * GET /api/organizer/analytics/revenue
     * Same as admin but filtered to organizer's assigned events only.
     */
    public function getOrganizerRevenue(Request $request)
    {
        $user = auth()->user();
        $assignedEventIds = DB::table('event_organizers')
            ->where('organizer_id', $user->user_id)
            ->pluck('event_id')
            ->toArray();

        if (empty($assignedEventIds)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => ['total_revenue' => 0, 'total_orders' => 0, 'avg_order_value' => 0],
                    'revenue_per_event' => [],
                    'daily_revenue' => [],
                    'payment_method_breakdown' => [],
                ],
            ]);
        }

        // Build a scoped revenue query
        $revenuePerEvent = DB::table('orders')
            ->join('events', 'orders.event_id', '=', 'events.event_id')
            ->where('orders.status', 'paid')
            ->whereIn('orders.event_id', $assignedEventIds)
            ->select(
                'events.event_id',
                'events.title',
                DB::raw('SUM(orders.total_price) as total_revenue'),
                DB::raw('COUNT(orders.order_id) as total_orders')
            )
            ->groupBy('events.event_id', 'events.title')
            ->orderByDesc('total_revenue')
            ->get();

        $dailyQuery = DB::table('orders')
            ->where('status', 'paid')
            ->whereIn('event_id', $assignedEventIds);

        if ($request->has('date_from')) {
            $dailyQuery->where('created_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $dailyQuery->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }
        if (!$request->has('date_from') && !$request->has('date_to')) {
            $dailyQuery->where('created_at', '>=', now()->subDays(30));
        }

        $dailyRevenue = (clone $dailyQuery)
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw('SUM(total_price) as revenue'),
                DB::raw('COUNT(order_id) as orders')
            )
            ->groupBy(DB::raw("DATE(created_at)"))
            ->orderBy('date')
            ->get();

        $totalRevenue = $revenuePerEvent->sum('total_revenue');
        $totalOrders = $revenuePerEvent->sum('total_orders');

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_orders' => (int) $totalOrders,
                    'avg_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
                ],
                'revenue_per_event' => $revenuePerEvent,
                'daily_revenue' => $dailyRevenue,
                'payment_method_breakdown' => [],
            ],
        ]);
    }

    /**
     * GET /api/organizer/analytics/transactions
     * Same as admin but filtered to organizer's assigned events only.
     */
    public function getOrganizerTransactions(Request $request)
    {
        $user = auth()->user();
        $assignedEventIds = DB::table('event_organizers')
            ->where('organizer_id', $user->user_id)
            ->pluck('event_id')
            ->toArray();

        if (empty($assignedEventIds)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'aggregates'          => null,
                    'status_breakdown'    => [],
                    'event_breakdown'     => [],
                    'recent_transactions' => [],
                ]
            ]);
        }

        // We can just override the request's event_id if they requested all, or if they requested a specific one, we verify it's assigned to them.
        if ($request->has('event_id')) {
            if (!in_array($request->input('event_id'), $assignedEventIds)) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'aggregates'          => null,
                        'status_breakdown'    => [],
                        'event_breakdown'     => [],
                        'recent_transactions' => [],
                    ]
                ]);
            }
        }

        $data = (function () use ($request, $assignedEventIds) {

            $query = DB::table('orders')
                ->leftJoin('events', 'orders.event_id', '=', 'events.event_id')
                ->leftJoin('payments', 'orders.order_id', '=', 'payments.order_id')
                ->whereIn('orders.event_id', $assignedEventIds); // Filter by organizer's events
            
            if ($request->has('event_id')) {
                $query->where('orders.event_id', $request->input('event_id'));
            }

            // Filter by date range
            if ($request->has('date_from')) {
                $query->where('orders.created_at', '>=', $request->input('date_from'));
            }
            if ($request->has('date_to')) {
                $query->where('orders.created_at', '<=', $request->input('date_to') . ' 23:59:59');
            }

            // Filter by order status
            if ($request->has('status')) {
                $query->where('orders.status', $request->input('status'));
            }

            // Aggregate metrics
            $aggregates = (clone $query)->select(
                DB::raw('COUNT(DISTINCT orders.order_id) as total_count'),
                DB::raw('COALESCE(SUM(orders.total_price), 0) as total_sum'),
                DB::raw('COALESCE(AVG(orders.total_price), 0) as total_avg'),
                DB::raw("SUM(CASE WHEN orders.status = 'paid' THEN orders.total_price ELSE 0 END) as paid_sum"),
                DB::raw("SUM(CASE WHEN orders.status = 'paid' THEN 1 ELSE 0 END) as paid_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'pending' THEN 1 ELSE 0 END) as pending_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'failed' THEN 1 ELSE 0 END) as failed_count"),
                DB::raw("SUM(CASE WHEN orders.status = 'canceled' THEN 1 ELSE 0 END) as canceled_count")
            )->first();

            // Breakdown by status
            $statusBreakdown = (clone $query)
                ->select(
                    'orders.status',
                    DB::raw('COUNT(DISTINCT orders.order_id) as count'),
                    DB::raw('COALESCE(SUM(orders.total_price), 0) as total')
                )
                ->groupBy('orders.status')
                ->get();

            // Breakdown by event
            $eventBreakdown = collect();
            if (!$request->has('event_id')) {
                $eventBreakdown = (clone $query)
                    ->select(
                        'events.event_id',
                        'events.title',
                        DB::raw('COUNT(DISTINCT orders.order_id) as count'),
                        DB::raw('COALESCE(SUM(orders.total_price), 0) as total'),
                        DB::raw('COALESCE(AVG(orders.total_price), 0) as avg')
                    )
                    ->whereNotNull('events.event_id')
                    ->groupBy('events.event_id', 'events.title')
                    ->orderByDesc('total')
                    ->get();
            }

            // Recent transactions
            $recentTransactions = (clone $query)
                ->select(
                    'orders.order_id',
                    'orders.status',
                    'orders.total_price',
                    'orders.payment_method',
                    'orders.created_at',
                    'events.title as event_title',
                    'payments.payment_gateway',
                    'payments.payment_date'
                )
                ->orderByDesc('orders.created_at')
                ->limit(200)
                ->get();

            return [
                'aggregates'          => $aggregates,
                'status_breakdown'    => $statusBreakdown,
                'event_breakdown'     => $eventBreakdown,
                'recent_transactions' => $recentTransactions,
            ];
        })();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/admin/analytics/ticket-scans
     * Get recent ticket scans/check-ins.
     */
    public function getTicketScans(Request $request)
    {
        $query = DB::table('tickets')
            ->join('ticket_types', 'tickets.ticket_type_id', '=', 'ticket_types.ticket_type_id')
            ->join('events', 'ticket_types.event_id', '=', 'events.event_id')
            ->whereNotNull('tickets.checked_in_at')
            ->where('tickets.status', 'used');

        if ($request->has('date_from')) {
            $query->where('tickets.checked_in_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $query->where('tickets.checked_in_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        $scans = $query->select(
            'tickets.ticket_id',
            'tickets.unique_code',
            'tickets.checked_in_at',
            'tickets.holder_name',
            'tickets.holder_email',
            'ticket_types.name as ticket_name',
            'events.title as event_title',
            'events.event_id'
        )->orderByDesc('tickets.checked_in_at')->limit(500)->get();

        return response()->json([
            'status' => 'success',
            'data' => $scans
        ]);
    }

    /**
     * GET /api/organizer/analytics/ticket-scans
     */
    public function getOrganizerTicketScans(Request $request)
    {
        $user = auth()->user();
        $assignedEventIds = DB::table('event_organizers')
            ->where('organizer_id', $user->user_id)
            ->pluck('event_id')
            ->toArray();

        if (empty($assignedEventIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $query = DB::table('tickets')
            ->join('ticket_types', 'tickets.ticket_type_id', '=', 'ticket_types.ticket_type_id')
            ->join('events', 'ticket_types.event_id', '=', 'events.event_id')
            ->whereNotNull('tickets.checked_in_at')
            ->where('tickets.status', 'used')
            ->whereIn('events.event_id', $assignedEventIds);

        if ($request->has('date_from')) {
            $query->where('tickets.checked_in_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $query->where('tickets.checked_in_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        $scans = $query->select(
            'tickets.ticket_id',
            'tickets.unique_code',
            'tickets.checked_in_at',
            'tickets.holder_name',
            'tickets.holder_email',
            'ticket_types.name as ticket_name',
            'events.title as event_title',
            'events.event_id'
        )->orderByDesc('tickets.checked_in_at')->limit(500)->get();

        return response()->json([
            'status' => 'success',
            'data' => $scans
        ]);
    }

    /**
     * Invalidate all analytics caches.
     * Call this when a new transaction is completed.
     */
    public static function clearAnalyticsCache(): void
    {
        try {
            // Flush all analytics-prefixed cache keys
            // For file/array cache drivers, we use tagged or pattern-based clearing
            Cache::flush(); // Simple approach for file driver
            Log::info('Analytics cache cleared successfully.');
        } catch (\Exception $e) {
            Log::warning('Failed to clear analytics cache: ' . $e->getMessage());
        }
    }
}
