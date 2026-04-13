<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;

class MerchandiseOrderController extends Controller
{
    public function __construct()
    {
        Configuration::setXenditKey(env('XENDIT_SECRET_KEY'));
    }

    /**
     * Calculate merchandise checkout totals
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.merch_id' => 'nullable|exists:merchandise,merch_id',
            'items.*.title' => 'nullable|string', // Allow lookup by title if merch_id not provided
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $subtotal = 0;
        $itemsBreakdown = [];

        foreach ($validated['items'] as $item) {
            // Try to find by merch_id first, then by title
            $merch = null;
            if (!empty($item['merch_id'])) {
                $merch = DB::table('merchandise')->find($item['merch_id']);
            } elseif (!empty($item['title'])) {
                $merch = DB::table('merchandise')->where('title', 'like', '%' . $item['title'] . '%')->first();
            }
            
            if (!$merch) {
                $identifier = $item['merch_id'] ?? $item['title'] ?? 'unknown';
                throw new \Exception("Product not found: {$identifier}");
            }
            
            if ($item['quantity'] > $merch->available_stock) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Insufficient stock for {$merch->title}. Available: {$merch->available_stock}, Requested: {$item['quantity']}"
                ], 400);
            }

            $lineTotal = $merch->price_usd * $item['quantity'];
            $subtotal += $lineTotal;

            $itemsBreakdown[] = [
                'merch_id' => $merch->merch_id,
                'title' => $merch->title,
                'unit_price' => (float) $merch->price_usd,
                'quantity' => $item['quantity'],
                'line_total' => (float) $lineTotal,
            ];
        }

        // Merchandise uses lower service fee (5.0)
        $serviceFee = 5.00;
        $tax = $subtotal * 0.08;
        $total = $subtotal + $serviceFee + $tax;

        return response()->json([
            'status' => 'success',
            'message' => 'Merchandise calculation successful',
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
     * Process instant merchandise checkout (NO QUEUE)
     */
    public function process(Request $request)
    {
        // Explicit authentication check with detailed error
        if (!auth()->check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: No valid authentication token provided'
            ], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.merch_id' => 'nullable|exists:merchandise,merch_id',
            'items.*.title' => 'nullable|string', // Allow lookup by title
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'shipping_address' => 'nullable|string',
        ]);

        $user = auth()->user();
        $paymentMethod = $request->input('payment_method', 'CARD');
        $shippingAddress = $request->input('shipping_address', '');

        try {
            DB::beginTransaction();

            $subtotal = 0;
            $itemsBreakdown = [];
            $merchOrders = [];

            foreach ($validated['items'] as $item) {
                // Try to find by merch_id first, then by title
                $merch = null;
                if (!empty($item['merch_id'])) {
                    $merch = DB::table('merchandise')->lockForUpdate()->find($item['merch_id']);
                } elseif (!empty($item['title'])) {
                    $merch = DB::table('merchandise')->lockForUpdate()->where('title', 'like', '%' . $item['title'] . '%')->first();
                }

                if (!$merch) {
                    $identifier = $item['merch_id'] ?? $item['title'] ?? 'unknown';
                    throw new \Exception("Product not found: {$identifier}");
                }

                if ($item['quantity'] > $merch->available_stock) {
                    throw new \Exception("Insufficient stock for {$merch->title}. Available: {$merch->available_stock}");
                }

                // Decrease stock immediately (instant purchase)
                DB::table('merchandise')
                    ->where('merch_id', $merch->merch_id)
                    ->decrement('available_stock', $item['quantity']);

                $lineTotal = $merch->price_usd * $item['quantity'];
                $subtotal += $lineTotal;

                $itemsBreakdown[] = [
                    'merch_id' => $merch->merch_id,
                    'title' => $merch->title,
                    'quantity' => $item['quantity'],
                    'unit_price' => $merch->price_usd,
                ];

                // Create merchandise order
                $merchOrderId = DB::table('merchandise_orders')->insertGetId([
                    'user_id' => $user->user_id,
                    'merch_id' => $merch->merch_id,
                    'quantity' => $item['quantity'],
                    'payment_type' => 'MONEY',
                    'amount_money' => $lineTotal,
                    'amount_credits' => 0,
                    'status' => 'pending',
                    'shipping_address' => $shippingAddress,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $merchOrders[] = $merchOrderId;
            }

            $serviceFee = 5.00;
            $tax = $subtotal * 0.08;
            $total = $subtotal + $serviceFee + $tax;

            $referenceId = 'MERCH-' . strtoupper(Str::random(10));

            // Create a virtual "order" for tracking purposes in orders table
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'event_id' => null, // Merchandise orders don't have events
                'status' => 'pending',
                'payment_method' => $paymentMethod,
                'payment_reference' => $referenceId,
                'total_price' => $total,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update all merch orders with the order_id
            DB::table('merchandise_orders')
                ->whereIn('merch_order_id', $merchOrders)
                ->update(['order_id' => $orderId]);

            // Generate Invoice Xendit
            $apiInstance = new InvoiceApi();
            $invoiceRequest = new CreateInvoiceRequest([
                'external_id' => $referenceId,
                'amount' => $total,
                'payer_email' => $user->email,
                'description' => 'Pembayaran Merchandise Vortex',
                'success_redirect_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/success?orderId=' . $orderId,
            ]);

            $invoice = $apiInstance->createInvoice($invoiceRequest);

            // Create payment record
            DB::table('payments')->insert([
                'order_id' => $orderId,
                'amount' => $total,
                'payment_date' => null,
                'payment_method' => 'XENDIT',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Award credits (10% of subtotal, not including fees)
            $earnedCredits = floor($subtotal * 0.10);

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
                    'reference_type' => 'merchandise',
                    'reference_id' => $orderId,
                    'description' => 'Earned from merchandise order #' . $orderId,
                    'created_at' => now(),
                ]);
            }

            DB::commit();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Merchandise checkout processed',
                'invoice_url' => $invoice['invoice_url'],
                'data' => [
                    'order_id' => $orderId,
                    'merch_order_ids' => $merchOrders,
                    'total_paid' => $total,
                    'items' => $itemsBreakdown,
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
