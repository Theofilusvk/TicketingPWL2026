<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;
use App\Models\Order;
use App\Models\TicketType;
use App\Jobs\SendTicketEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private function processSuccessfulPayment($order)
    {
        if ($order->status === 'paid') return;

        DB::beginTransaction();
        try {
            DB::table('orders')->where('order_id', $order->order_id)->update(['status' => 'paid']);
            DB::table('payments')->where('order_id', $order->order_id)->update(['status' => 'paid', 'payment_date' => now()]);

            if ($order->event_id === null) {
                // Merchandise Order
                DB::table('merchandise_orders')->where('order_id', $order->order_id)->update(['status' => 'paid']);
            } else {
                // Event Ticket Order
                // Generate Tickets
                $orderItems = DB::table('order_items')->where('order_id', $order->order_id)->get();
                foreach ($orderItems as $item) {
                    $assignments = !empty($item->assignments) ? json_decode($item->assignments, true) : [];
                    for ($i = 0; $i < $item->quantity; $i++) {
                        $assignment = $assignments[$i] ?? [];
                        $uniqueCode = 'TCK-' . strtoupper(\Illuminate\Support\Str::random(8));
                        $qrPath = \App\Helpers\QrCodeGenerator::generateForTicket($uniqueCode, 'order_' . $order->order_id);
                        
                        DB::table('tickets')->insert([
                            'order_item_id' => $item->order_item_id,
                            'unique_code' => $uniqueCode,
                            'qr_code_path' => $qrPath,
                            'holder_name' => $assignment['name'] ?? null,
                            'holder_email' => $assignment['email'] ?? null,
                            'status' => 'available',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            // Credit transaction 10%
            $earnedCredits = floor($order->total_price * 0.10);
            if ($earnedCredits > 0) {
                $lastTransaction = DB::table('credit_transactions')
                    ->where('user_id', $order->user_id)
                    ->orderBy('transaction_id', 'desc')
                    ->first();
                $lastBalance = $lastTransaction ? $lastTransaction->balance_after : 0;
                DB::table('credit_transactions')->insert([
                    'user_id' => $order->user_id,
                    'type' => 'EARN',
                    'amount' => $earnedCredits,
                    'balance_after' => $lastBalance + $earnedCredits,
                    'reference_type' => 'order',
                    'reference_id' => $order->order_id,
                    'description' => 'Earned from order #' . $order->order_id,
                    'created_at' => now(),
                ]);
            }

            DB::commit();

            // Call job to send email (both tickets and merchandise handled internally)
            SendTicketEmail::dispatch($order->order_id);

            // Clear analytics cache so dashboards show fresh data
            AnalyticsController::clearAnalyticsCache();

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    public function __construct()
    {
        Configuration::setXenditKey(env('XENDIT_SECRET_KEY'));
    }

    public function checkout(Request $request)
    {
        // Authenticate
        if (!auth()->check()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.event_id' => 'required|exists:events,event_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.phase' => 'nullable|string',
            'items.*.price' => 'nullable|numeric',
            'items.*.assignments' => 'nullable|array',
            'payment_method' => 'nullable|string',
        ]);

        $user = auth()->user();
        DB::beginTransaction();
        try {
            $subtotal = 0;
            $itemsBreakdown = [];
            $eventId = null;

            foreach ($validated['items'] as $item) {
                // Try to map to the exact tier if provided, otherwise default to first available
                $query = TicketType::lockForUpdate()->where('event_id', $item['event_id']);
                $searchTerm = $item['phase'] ?? '';
                
                if ($searchTerm === 'PHASE_01') {
                    $query->where(function($q) {
                        $q->where('name', 'like', '%General%')->orWhere('name', 'like', '%Regular%');
                    });
                } else if ($searchTerm === 'PHASE_02') {
                    $query->where('name', 'like', '%VIP%');
                } else if ($searchTerm === 'ELITE') {
                    $query->where(function($q) {
                        $q->where('name', 'like', '%VVIP%')->orWhere('name', 'like', '%Premium%')->orWhere('name', 'like', '%Pass%');
                    });
                } else if (!empty($searchTerm)) {
                    $query->where('name', 'like', '%' . $searchTerm . '%');
                }
                
                $ticketType = $query->first();

                if (!$ticketType) {
                    $ticketType = TicketType::lockForUpdate()->where('event_id', $item['event_id'])->first();
                }

                if (!$ticketType) {
                    throw new \Exception("Tidak ada tipe tiket untuk event ID: {$item['event_id']}");
                }

                if ($item['quantity'] > $ticketType->available_stock) {
                    $ticketType = TicketType::lockForUpdate()->where('event_id', $item['event_id'])
                        ->where('available_stock', '>=', $item['quantity'])->first();
                        
                    if (!$ticketType) {
                        throw new \Exception("Stok tidak mencukupi untuk tiket pada event tersebut.");
                    }
                }

                if (!$eventId) {
                    $eventId = $ticketType->event_id;
                }

                // Reduce stock immediately (will be rolled back if exception or webhook fails)
                $ticketType->available_stock -= $item['quantity'];
                $ticketType->save();

                // To ensure Xendit total perfectly matches frontend mock UI:
                $unitPrice = isset($item['price']) ? $item['price'] : $ticketType->price;
                $subtotal += $unitPrice * $item['quantity'];

                $itemsBreakdown[] = [
                    'ticket_type_id' => $ticketType->ticket_type_id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'assignments' => $item['assignments'] ?? [],
                ];
            }

            $serviceFee = 12.50; // default for tickets
            $tax = $subtotal * 0.08;
            $total = $subtotal + $serviceFee + $tax;

            $referenceId = 'ORD-' . strtoupper(Str::random(10));

            // Create Order as Pending
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id, // ensure user object maps appropriately
                'event_id' => $eventId,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'] ?? 'XENDIT',
                'payment_reference' => $referenceId,
                'total_price' => $total,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($itemsBreakdown as $b) {
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'ticket_type_id' => $b['ticket_type_id'],
                    'quantity' => $b['quantity'],
                    'unit_price' => $b['unit_price'],
                    'assignments' => json_encode($b['assignments']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Generate Invoice Xendit
            $apiInstance = new InvoiceApi();
            $invoiceRequest = new CreateInvoiceRequest([
                'external_id' => $referenceId,
                'amount' => $total,
                'payer_email' => $user->email,
                'description' => 'Pembayaran Tiket Event',
                'success_redirect_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/success?orderId=' . $orderId,
            ]);

            $invoice = $apiInstance->createInvoice($invoiceRequest);

            DB::table('payments')->insert([
                'order_id' => $orderId,
                'amount' => $total,
                'payment_date' => null,
                'payment_method' => 'XENDIT',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'invoice_url' => $invoice['invoice_url'],
                'data' => [
                   'order_id' => $orderId
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function webhook(Request $request)
    {
        $xenditToken = env('XENDIT_WEBHOOK_TOKEN');
        $callbackToken = $request->header('x-callback-token');

        if ($xenditToken !== $callbackToken) {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $externalId = $request->input('external_id');
        $status = $request->input('status');

        if ($status === 'PAID' || $status === 'SETTLED') {
            try {
                $order = DB::table('orders')->where('payment_reference', $externalId)->first();
                if ($order && $order->status !== 'paid') {
                    $this->processSuccessfulPayment($order);
                }
            } catch (\Exception $e) {
                return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
            }
        }

        return response()->json(['status' => 'success']);
    }

    public function getOrderDetails($orderId)
    {
        $order = DB::table('orders')->where('order_id', $orderId)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        // Active pull mechanism for local testing (if Webhook didn't fire)
        if ($order->status === 'pending') {
            try {
                $apiInstance = new \Xendit\Invoice\InvoiceApi();
                $invoices = $apiInstance->getInvoices(null, $order->payment_reference);
                
                if (count($invoices) > 0) {
                    $inv = $invoices[0];
                    if ($inv->getStatus() === 'PAID' || $inv->getStatus() === 'SETTLED') {
                        $this->processSuccessfulPayment($order);
                        $order->status = 'paid'; // update memory state
                    }
                }
            } catch (\Throwable $e) {
                // Ignore API limitations momentarily
                \Illuminate\Support\Facades\Log::error('GetOrderDetails Error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            }
        }

        $isMerchandise = false;
        $itemsData = [];

        if ($order->event_id === null) {
            $isMerchandise = true;
            $merchOrders = DB::table('merchandise_orders')
                ->join('merchandise', 'merchandise_orders.merch_id', '=', 'merchandise.merch_id')
                ->where('order_id', $orderId)
                ->select('merchandise_orders.*', 'merchandise.title')
                ->get();
            
            foreach ($merchOrders as $m) {
                $itemsData[] = [
                    'id' => 'ITM-' . $m->merch_order_id,
                    'eventName' => $m->title, // Reusing field name for UI compatibility
                    'date' => explode(' ', $m->created_at)[0] ?? 'N/A',
                    'tier' => 'MERCHANDISE', // Reusing field name for UI compatibility
                    'quantity' => $m->quantity
                ];
            }
        } else {
            $event = DB::table('events')->where('event_id', $order->event_id)->first();
            
            $orderItems = DB::table('order_items')
                ->join('ticket_types', 'order_items.ticket_type_id', '=', 'ticket_types.ticket_type_id')
                ->where('order_id', $orderId)
                ->select('order_items.*', 'ticket_types.name as tier_name')
                ->get();
                
            $tickets = DB::table('tickets')
                ->whereIn('order_item_id', $orderItems->pluck('order_item_id')->toArray())
                ->get();

            foreach ($tickets as $t) {
                $item = $orderItems->firstWhere('order_item_id', $t->order_item_id);
                $itemsData[] = [
                    'id' => $t->unique_code,
                    'eventName' => $event ? $event->title : 'VORTEX EVENT',
                    'date' => $event ? explode(' ', $event->start_time)[0] : 'TBA',
                    'tier' => $item ? $item->tier_name : 'GENERAL'
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'orderId' => 'ORD-' . $order->order_id,
                'total' => $order->total_price,
                'tickets' => $itemsData, // Maps to tickets in UI
                'isMerchandise' => $isMerchandise,
                'status' => $order->status
            ]
        ]);
    }

    /**
     * Download the PDF e-ticket for a given order.
     */
    public function downloadPdf($id)
    {
        $order = Order::with(['event'])->find($id);
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        $user = DB::table('users')->where('user_id', $order->user_id)->first();
        
        $isMerchandise = ($order->event_id === null);
        $orderItems = collect();
        $tickets = collect();
        $merchandiseOrders = collect();

        if ($isMerchandise) {
            $merchandiseOrders = DB::table('merchandise_orders')
                ->join('merchandise', 'merchandise_orders.merch_id', '=', 'merchandise.merch_id')
                ->where('order_id', $order->order_id)
                ->select('merchandise_orders.*', 'merchandise.title')
                ->get();
        } else {
            $orderItems = DB::table('order_items')
                ->join('ticket_types', 'order_items.ticket_type_id', '=', 'ticket_types.ticket_type_id')
                ->where('order_items.order_id', $order->order_id)
                ->select('order_items.*', 'ticket_types.name as ticket_name')
                ->get();

            $tickets = DB::table('tickets')
                ->whereIn('order_item_id', $orderItems->pluck('order_item_id'))
                ->get();
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.ticket', [
            'order' => $order,
            'user' => $user,
            'orderItems' => $orderItems,
            'tickets' => $tickets,
            'isMerchandise' => $isMerchandise,
            'merchandiseOrders' => $merchandiseOrders
        ]);

        return $pdf->download($isMerchandise ? 'invoice-ORD-' . $order->order_id . '.pdf' : 'e-ticket-ORD-' . $order->order_id . '.pdf');
    }

    /**
     * Re-send the e-ticket email for a given order.
     */
    public function resendEmail(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        // Optionally override the recipient email
        $targetEmail = $request->input('email');

        if ($targetEmail) {
            // Send to a custom email address
            $user = DB::table('users')->where('user_id', $order->user_id)->first();
            
            $isMerchandise = ($order->event_id === null);
            $orderItems = collect();
            $tickets = collect();
            $merchandiseOrders = collect();

            if ($isMerchandise) {
                $merchandiseOrders = DB::table('merchandise_orders')
                    ->join('merchandise', 'merchandise_orders.merch_id', '=', 'merchandise.merch_id')
                    ->where('order_id', $order->order_id)
                    ->select('merchandise_orders.*', 'merchandise.title')
                    ->get();
            } else {
                $orderItems = DB::table('order_items')
                    ->join('ticket_types', 'order_items.ticket_type_id', '=', 'ticket_types.ticket_type_id')
                    ->where('order_items.order_id', $order->order_id)
                    ->select('order_items.*', 'ticket_types.name as ticket_name')
                    ->get();
                $tickets = DB::table('tickets')
                    ->whereIn('order_item_id', $orderItems->pluck('order_item_id'))
                    ->get();
            }

            $pdfContent = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.ticket', [
                'order' => $order,
                'user' => $user,
                'orderItems' => $orderItems,
                'tickets' => $tickets,
                'isMerchandise' => $isMerchandise,
                'merchandiseOrders' => $merchandiseOrders
            ])->output();

            \Illuminate\Support\Facades\Mail::to($targetEmail)
                ->send(new \App\Mail\TicketEmail($order, $user, $orderItems, $tickets, $pdfContent, $isMerchandise, $merchandiseOrders));
        } else {
            // Re-dispatch the original job (sends to user's registered email)
            SendTicketEmail::dispatch($order->order_id);
        }

        return response()->json(['status' => 'success', 'message' => 'Email sent successfully']);
    }
}
