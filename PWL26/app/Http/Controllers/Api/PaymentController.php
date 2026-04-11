<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Ticket;
use App\Jobs\SendTicketEmail;
use Illuminate\Support\Str;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;

class PaymentController extends Controller
{
    public function __construct()
    {
        Configuration::setXenditKey(env('XENDIT_SECRET_KEY'));
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,order_id'
        ]);

        $order = Order::with('user')->find($request->order_id);

        if ($order->status === 'success') {
            return response()->json(['message' => 'Order is already paid'], 400);
        }

        // Initialize Xendit Invoice API
        $apiInstance = new InvoiceApi();

        $externalId = 'ORDER-' . $order->order_id . '-' . time();
        $order->payment_reference = $externalId;
        $order->payment_method = 'xendit';
        $order->save();

        $amount = (float) $order->price;

        $createInvoiceRequest = new CreateInvoiceRequest([
            'external_id' => $externalId,
            'amount' => $amount > 0 ? $amount : 10000, // Fallback if amount is 0
            'payer_email' => $order->user ? $order->user->email : 'guest@example.com',
            'description' => 'Payment for Order #' . $order->order_id,
            'success_redirect_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/success',
            'failure_redirect_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/failed',
        ]);

        try {
            $invoice = $apiInstance->createInvoice($createInvoiceRequest);
            return response()->json([
                'status' => 'success',
                'order_id' => $order->order_id,
                'invoice_url' => $invoice['invoice_url'] ?? $invoice->getInvoiceUrl(),
                'external_id' => $externalId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create Xendit invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        $xenditXCToken = $request->header('x-callback-token');
        $serverToken = env('XENDIT_WEBHOOK_TOKEN');

        if ($serverToken && $xenditXCToken !== $serverToken) {
            return response()->json(['message' => 'Invalid token'], 403);
        }

        $externalId = $request->input('external_id');
        $status = $request->input('status');

        $order = Order::where('payment_reference', $externalId)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($status === 'PAID') {
            if ($order->status !== 'success') {
                $order->status = 'success';
                $order->save();

                $this->generateTickets($order);
                // Trigger email job
                SendTicketEmail::dispatch($order);
            }
        } elseif (in_array($status, ['EXPIRED', 'FAILED'])) {
            if ($order->status !== 'failed') {
                $order->status = 'failed';
                $order->save();
            }
        }

        return response()->json(['message' => 'Webhook processed successfully']);
    }

    private function generateTickets(Order $order)
    {
        if ($order->items && $order->items->count() > 0) {
            foreach ($order->items as $item) {
                $qty = isset($item->quantity) ? $item->quantity : 1;
                for ($i = 0; $i < $qty; $i++) {
                    Ticket::create([
                        'order_id' => $order->order_id,
                        'event_id' => $order->event_id,
                        'ticket_code' => strtoupper(Str::random(10)),
                        'status' => 'valid',
                    ]);
                }
            }
        } else {
            Ticket::create([
                'order_id' => $order->order_id,
                'event_id' => $order->event_id,
                'ticket_code' => strtoupper(Str::random(10)),
                'status' => 'valid',
            ]);
        }
    }
}
