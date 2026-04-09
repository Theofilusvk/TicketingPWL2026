<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{

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

    /**
     * Process checkout and create orders, payments, order_items, and tickets
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.event_id' => 'required|exists:events,event_id', // Accepts event_id from mocked frontend
            'items.*.quantity' => 'required|integer|min:1',
            'is_merch' => 'nullable|boolean',
            'payment_method' => 'nullable|string',
        ]);

        $user = auth()->user();
        $isMerch = $request->input('is_merch', false);
        $paymentMethod = $request->input('payment_method', 'CARD');

        try {
            DB::beginTransaction();

            $subtotal = 0;
            $itemsBreakdown = [];
            $eventId = null;

            foreach ($validated['items'] as $item) {
                // Find a ticket type that belongs to this event
                $ticketType = TicketType::lockForUpdate()->where('event_id', $item['event_id'])->first();

                if (!$ticketType) {
                    throw new \Exception("Tidak ada tipe tiket untuk event ID: {$item['event_id']}");
                }

                if ($item['quantity'] > $ticketType->available_stock) {
                    // Try to find another one if out of stock
                    $ticketType = TicketType::lockForUpdate()->where('event_id', $item['event_id'])
                        ->where('available_stock', '>=', $item['quantity'])->first();
                        
                    if (!$ticketType) {
                        throw new \Exception("Stok tidak mencukupi untuk tiket pada event tersebut.");
                    }
                }

                if (!$eventId) {
                    $eventId = $ticketType->event_id;
                }

                $ticketType->available_stock -= $item['quantity'];
                $ticketType->save();

                $lineTotal = $ticketType->price * $item['quantity'];
                $subtotal += $lineTotal;

                $itemsBreakdown[] = [
                    'ticket_type_id' => $ticketType->ticket_type_id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $ticketType->price,
                ];
            }

            $serviceFee = count($itemsBreakdown) > 0 ? ($isMerch ? 5.00 : 12.50) : 0;
            $tax = $subtotal * 0.08;
            $total = $subtotal + $serviceFee + $tax;

            // 1. Create Order
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'event_id' => $eventId,
                'status' => 'paid', // Immediately paid for dummy integration
                'payment_method' => $paymentMethod,
                'payment_reference' => 'REF-' . strtoupper(Str::random(10)),
                'total_price' => $total,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Create Order Items and Tickets
            $createdTickets = [];
            foreach ($itemsBreakdown as $b) {
                // Order item
                $orderItemId = DB::table('order_items')->insertGetId([
                    'order_id' => $orderId,
                    'ticket_type_id' => $b['ticket_type_id'],
                    'quantity' => $b['quantity'],
                    'unit_price' => $b['unit_price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Virtual Tickets
                for ($i = 0; $i < $b['quantity']; $i++) {
                    $ticketIdStr = 'TCK-' . strtoupper(Str::random(8));
                    DB::table('tickets')->insert([
                        'order_item_id' => $orderItemId,
                        'unique_code' => $ticketIdStr,
                        'status' => 'available',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdTickets[] = $ticketIdStr;
                }
            }

            // 3. Create Payment
            DB::table('payments')->insert([
                'order_id' => $orderId,
                'amount' => $total,
                'payment_date' => now(),
                'payment_method' => $paymentMethod,
                'status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // (Optional) Award Credits (e.g. 10% of total)
            $earnedCredits = floor($total * 0.10);

            // Record Credit Transaction if we have earned credits
            if ($earnedCredits > 0) {
                $lastTransaction = DB::table('credit_transactions')
                                    ->where('user_id', $user->user_id)
                                    ->orderBy('transaction_id', 'desc')
                                    ->first();
                $lastBalance = $lastTransaction ? $lastTransaction->balance_after : 0;
                
                DB::table('credit_transactions')->insert([
                    'user_id' => $user->user_id,
                    'type' => 'EARN',
                    'amount' => $earnedCredits,
                    'balance_after' => $lastBalance + $earnedCredits,
                    'reference_type' => 'order',
                    'reference_id' => $orderId,
                    'description' => 'Earned from order #' . $orderId,
                    'created_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout processed successfully',
                'data' => [
                    'order_id' => $orderId,
                    'total_paid' => $total,
                    'tickets' => $createdTickets,
                    'earned_credits' => $earnedCredits
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
