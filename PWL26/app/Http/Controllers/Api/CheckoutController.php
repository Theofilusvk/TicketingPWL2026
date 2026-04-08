<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketType;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    /**
     * Calculate the total price needed to be paid for items in the cart
     * including Subtotal, Service Fee, and Tax dynamically connected to the database prices.
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.ticket_type_id' => 'required|exists:ticket_types,ticket_type_id',
            'items.*.quantity' => 'required|integer|min:1',
            'is_merch' => 'nullable|boolean', // Used to determine correct service fee matching frontend
        ]);

        $subtotal = 0;
        $itemsBreakdown = [];

        foreach ($validated['items'] as $item) {
            $ticketType = TicketType::with('event')->find($item['ticket_type_id']);
            
            // Check stock logic could also be added here if needed
            // if ($item['quantity'] > $ticketType->available_stock) ...
            
            $lineTotal = $ticketType->price * $item['quantity'];
            $subtotal += $lineTotal;

            $itemsBreakdown[] = [
                'ticket_type_id' => $ticketType->ticket_type_id,
                'name' => $ticketType->name,
                'event_name' => collect($ticketType->event)->get('title', 'Unknown Event'),
                'unit_price' => (float) $ticketType->price,
                'quantity' => $item['quantity'],
                'line_total' => (float) $lineTotal,
            ];
        }

        // Apply service fee matching the vortex-web cart logic. 
        // Tickets use 12.50, Merch uses 5.0
        $isMerch = $request->input('is_merch', false);
        $serviceFee = count($itemsBreakdown) > 0 ? ($isMerch ? 5.00 : 12.50) : 0;
        
        // 8% tax on the subtotal matching frontend calculation
        $tax = $subtotal * 0.08;
        
        $total = $subtotal + $serviceFee + $tax;

        return response()->json([
            'status' => 'success',
            'message' => 'Cart calculation successful',
            'data' => [
                'items' => $itemsBreakdown,
                'summary' => [
                    'subtotal' => (float) $subtotal,
                    'service_fee' => (float) $serviceFee,
                    'tax' => (float) $tax,
                    'total_payable' => (float) $total,
                ]
            ]
        ], 200);
    }
}
