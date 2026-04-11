<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->input('per_page', 20);
        
        $notifications = Notification::where('user_id', $user->user_id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        $count = Notification::where('user_id', $user->user_id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Get recent unread notifications
     */
    public function unread(Request $request): JsonResponse
    {
        $user = Auth::user();
        $limit = $request->input('limit', 5);

        $notifications = Notification::where('user_id', $user->user_id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();

        Notification::where('user_id', $user->user_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Admin: Create notification for specific event or broadcast
     */
    public function createAdmin(Request $request): JsonResponse
    {
        // Check if user is admin
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'event_id' => 'nullable|exists:events,event_id',
            'type' => 'required|in:admin_broadcast,event_reminder,event_canceled,ticket_purchased,payment_success,payment_failed,waiting_list_available',
            'title' => 'required|string|max:200',
            'message' => 'required|string',
            'logo_url' => 'nullable|url',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,user_id',
        ]);

        $notifications = [];

        // If specific users are provided, notify only those
        if (!empty($validated['user_ids'])) {
            foreach ($validated['user_ids'] as $userId) {
                $notifications[] = Notification::create([
                    'user_id' => $userId,
                    'event_id' => $validated['event_id'] ?? null,
                    'type' => $validated['type'],
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'logo_url' => $validated['logo_url'] ?? null,
                ]);
            }
        } else if ($validated['event_id']) {
            // If event is provided, notify all users with tickets for that event
            $userIds = \DB::table('tickets')
                ->join('order_items', 'tickets.order_item_id', '=', 'order_items.order_item_id')
                ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
                ->where('orders.event_id', $validated['event_id'])
                ->distinct()
                ->pluck('orders.user_id')
                ->toArray();

            foreach ($userIds as $userId) {
                $notifications[] = Notification::create([
                    'user_id' => $userId,
                    'event_id' => $validated['event_id'],
                    'type' => $validated['type'],
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'logo_url' => $validated['logo_url'] ?? null,
                ]);
            }
        } else {
            // Broadcast to all users
            $userIds = \DB::table('users')->pluck('user_id')->toArray();

            foreach ($userIds as $userId) {
                $notifications[] = Notification::create([
                    'user_id' => $userId,
                    'type' => $validated['type'],
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'logo_url' => $validated['logo_url'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Notifications created successfully',
            'count' => count($notifications),
        ]);
    }

    /**
     * Admin: Get all notifications (for monitoring)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 50);
        
        $notifications = Notification::with(['user', 'event'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Delete notification (only for user's own notifications)
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
