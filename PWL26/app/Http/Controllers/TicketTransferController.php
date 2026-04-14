<?php

namespace App\Http\Controllers;

use App\Models\TicketTransfer;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketingService;
use Illuminate\Http\Request;

class TicketTransferController extends Controller
{
    protected $ticketingService;

    public function __construct(TicketingService $ticketingService)
    {
        $this->ticketingService = $ticketingService;
    }

    /**
     * Get all transfers for logged-in user
     */
    public function myTransfers(Request $request)
    {
        $userId = auth()->id();

        $transfers = TicketTransfer::where('from_user_id', $userId)
            ->orWhere('to_user_id', $userId)
            ->with(['ticket', 'fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transfers);
    }

    /**
     * Get pending transfers for user (awaiting decision)
     */
    public function pendingTransfers()
    {
        $userId = auth()->id();

        $transfers = TicketTransfer::where('to_user_id', $userId)
            ->where('status', 'pending')
            ->with(['ticket', 'fromUser'])
            ->get();

        return response()->json($transfers);
    }

    /**
     * Create transfer offer
     */
    public function createTransfer(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,ticket_id',
            'to_user_id' => 'required|exists:users,user_id',
            'transfer_price' => 'nullable|numeric|min:0',
            'expires_in' => 'nullable|integer|min:1|max:720', // max 30 days
        ]);

        $ticket = Ticket::findOrFail($validated['ticket_id']);
        $userId = auth()->id();

        // Verify ownership
        if ($ticket->orderItem->order->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $expiresIn = $validated['expires_in'] ?? 48;
        $transfer = $this->ticketingService->createTransferOffer(
            $ticket,
            $userId,
            $validated['to_user_id'],
            $validated['transfer_price'] ?? null,
            $expiresIn
        );

        return response()->json($transfer, 201);
    }

    /**
     * Accept transfer offer
     */
    public function acceptTransfer(TicketTransfer $transfer)
    {
        if ($transfer->to_user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($transfer->status !== 'pending') {
            return response()->json(['error' => 'Transfer is no longer pending'], 400);
        }

        $success = $this->ticketingService->acceptTransfer($transfer);

        if (!$success) {
            return response()->json(['error' => 'Failed to accept transfer'], 400);
        }

        return response()->json(['message' => 'Transfer accepted successfully']);
    }

    /**
     * Reject transfer offer
     */
    public function rejectTransfer(Request $request, TicketTransfer $transfer)
    {
        if ($transfer->to_user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $this->ticketingService->rejectTransfer($transfer, $validated['reason'] ?? null);

        return response()->json(['message' => 'Transfer rejected']);
    }

    /**
     * Cancel ticket (for owner)
     */
    public function cancelTicket(Request $request, Ticket $ticket)
    {
        $userId = auth()->id();

        if ($ticket->orderItem->order->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($ticket->status !== 'available') {
            return response()->json(['error' => 'Ticket cannot be cancelled'], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $transfer = $this->ticketingService->cancelTicket(
            $ticket,
            $userId,
            $validated['reason'] ?? null
        );

        if (!$transfer) {
            return response()->json(['error' => 'Failed to cancel ticket'], 400);
        }

        return response()->json(['message' => 'Ticket cancelled successfully']);
    }

    /**
     * List all transfers (admin)
     */
    public function index(Request $request)
    {
        $transfers = TicketTransfer::with(['ticket', 'fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($transfers);
    }

    /**
     * Show single transfer
     */
    public function show(TicketTransfer $transfer)
    {
        $transfer->load(['ticket', 'fromUser', 'toUser']);
        return response()->json($transfer);
    }
}
