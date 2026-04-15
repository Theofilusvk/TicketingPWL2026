<?php

namespace App\Services;

use App\Models\WaitingList;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\TicketTransfer;
use App\Models\VenueSection;
use Illuminate\Support\Facades\DB;

class TicketingService
{
    /**
     * Process waiting list and convert to orders if tickets available
     */
    public function processWaitingList(Event $event)
    {
        $waitingList = WaitingList::where('event_id', $event->event_id)
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->get();

        foreach ($waitingList as $entry) {
            if (!$event->isSoldOut()) {
                $this->convertWaitingListToOrder($entry);
            } else {
                break; // Stop if event is sold out
            }
        }
    }

    /**
     * Convert waiting list entry to order
     */
    private function convertWaitingListToOrder(WaitingList $entry)
    {
        try {
            DB::beginTransaction();

            // Get available section for this ticket type
            $section = VenueSection::where('event_id', $entry->event_id)
                ->where('status', 'active')
                ->where('price', '<=', $entry->preferred_price ?? 999999)
                ->firstOrFail();

            if ($section->isSoldOut()) {
                DB::rollBack();
                return false;
            }

            // Create order
            $order = Order::create([
                'user_id' => $entry->user_id,
                'event_id' => $entry->event_id,
                'status' => 'waitlist_converted',
                'payment_method' => 'waiting_list_conversion',
                'price' => $section->price,
            ]);

            // Create order item
            $orderItem = OrderItem::create([
                'order_id' => $order->order_id,
                'category_id' => $entry->ticketType?->category_id,
                'ticket_type' => $entry->ticketType?->ticket_type_name,
                'quantity' => 1,
            ]);

            // Create ticket
            Ticket::create([
                'order_item_id' => $orderItem->order_item_id,
                'section_id' => $section->section_id,
                'unique_code' => $this->generateUniqueTicketCode(),
                'status' => 'available',
            ]);

            // Update section sold count
            $section->increment('sold_tickets');
            $entry->event->increment('total_sold');

            // Update waiting list entry
            $entry->update([
                'status' => 'converted',
                'created_at' => now(), // Move to end
            ]);

            DB::commit();

            // Notify user through notification
            $this->notifyWaitingListConversion($entry);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to convert waiting list entry: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create ticket transfer offer
     */
    public function createTransferOffer(Ticket $ticket, $fromUserId, $toUserId, $transferPrice = null, $expiresIn = 48)
    {
        try {
            DB::beginTransaction();

            $transfer = TicketTransfer::create([
                'ticket_id' => $ticket->ticket_id,
                'from_user_id' => $fromUserId,
                'to_user_id' => $toUserId,
                'type' => 'transfer',
                'transfer_price' => $transferPrice,
                'status' => 'pending',
                'expires_at' => now()->addHours($expiresIn),
            ]);

            DB::commit();

            // Send notification to recipient
            $this->notifyTransferOffer($transfer);

            return $transfer;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create transfer offer: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Accept ticket transfer
     */
    public function acceptTransfer(TicketTransfer $transfer)
    {
        try {
            DB::beginTransaction();

            if ($transfer->isExpired()) {
                return false;
            }

            $ticket = $transfer->ticket;
            $oldOrderItem = $ticket->orderItem;

            // Create new order for recipient
            $newOrder = Order::create([
                'user_id' => $transfer->to_user_id,
                'event_id' => $ticket->orderItem->order->event_id,
                'status' => 'ticket_transfer',
                'payment_method' => 'ticket_transfer',
                'price' => $transfer->transfer_price ?? 0,
            ]);

            // Create new order item for recipient
            $newOrderItem = OrderItem::create([
                'order_id' => $newOrder->order_id,
                'category_id' => $oldOrderItem->category_id,
                'ticket_type' => $oldOrderItem->ticket_type,
                'quantity' => 1,
            ]);

            // Update ticket to new order
            $ticket->update([
                'order_item_id' => $newOrderItem->order_item_id,
            ]);

            // Update transfer status
            $transfer->update(['status' => 'completed']);

            // Reject other pending transfers for this ticket
            TicketTransfer::where('ticket_id', $ticket->ticket_id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            DB::commit();

            $this->notifyTransferCompleted($transfer);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to accept transfer: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Reject ticket transfer
     */
    public function rejectTransfer(TicketTransfer $transfer, $reason = null)
    {
        $transfer->update([
            'status' => 'rejected',
            'reason' => $reason,
        ]);

        $this->notifyTransferRejected($transfer);
    }

    /**
     * Cancel ticket (convert to cancellation transfer)
     */
    public function cancelTicket(Ticket $ticket, $userId, $reason = null)
    {
        try {
            DB::beginTransaction();

            $transfer = TicketTransfer::create([
                'ticket_id' => $ticket->ticket_id,
                'from_user_id' => $userId,
                'to_user_id' => null,
                'type' => 'cancellation',
                'status' => 'completed',
                'reason' => $reason,
            ]);

            // Update ticket status
            $ticket->update(['status' => 'cancelled']);

            // Update event and section sold count
            if ($ticket->section) {
                $ticket->section->decrement('sold_tickets');
            }
            $ticket->orderItem->order->event->decrement('total_sold');

            // Process waiting list if there are people waiting
            $this->processWaitingList($ticket->orderItem->order->event);

            DB::commit();

            return $transfer;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to cancel ticket: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate unique ticket code
     */
    private function generateUniqueTicketCode()
    {
        do {
            $code = strtoupper(uniqid('TICKET_', true));
        } while (Ticket::where('unique_code', $code)->exists());

        return $code;
    }

    /**
     * Add user to waiting list
     */
    public function addToWaitingList($userId, $eventId, $ticketTypeId, $preferredPrice = null)
    {
        // Check if user already in waiting list
        $existing = WaitingList::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('ticket_type_id', $ticketTypeId)
            ->first();

        if ($existing) {
            return $existing;
        }

        // Get queue position
        $queuePosition = WaitingList::where('event_id', $eventId)
            ->where('status', 'waiting')
            ->count();

        return WaitingList::create([
            'event_id' => $eventId,
            'user_id' => $userId,
            'ticket_type_id' => $ticketTypeId,
            'status' => 'waiting',
            'queue_position' => $queuePosition + 1,
            'preferred_price' => $preferredPrice,
        ]);
    }

    /**
     * Notification helpers
     */
    private function notifyWaitingListConversion(WaitingList $entry)
    {
        // TODO: Implement notification system
        \Log::info("Waiting list entry converted for user {$entry->user_id}");
    }

    private function notifyTransferOffer(TicketTransfer $transfer)
    {
        // TODO: Implement notification system
        \Log::info("Transfer offer created for user {$transfer->to_user_id}");
    }

    private function notifyTransferCompleted(TicketTransfer $transfer)
    {
        // TODO: Implement notification system
        \Log::info("Transfer completed between users {$transfer->from_user_id} and {$transfer->to_user_id}");
    }

    private function notifyTransferRejected(TicketTransfer $transfer)
    {
        // TODO: Implement notification system
        \Log::info("Transfer rejected for user {$transfer->from_user_id}");
    }
}
