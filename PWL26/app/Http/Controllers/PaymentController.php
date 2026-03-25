<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketMail;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with('order')->get();
        return view('payments.index', compact('payments'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $orders = Order::all();
        return view('payments.create', compact('orders'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'amount' => 'required|numeric',
            'payment_gateway' => 'nullable|string|max:50',
            'payment_date' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        Payment::create($validated);
        return redirect()->route('payments.index')->with('success', 'Payment created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payment = Payment::with('order')->findOrFail($id);
        return view('payments.show', compact('payment'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $payment = Payment::findOrFail($id);
        $orders = Order::all();
        return view('payments.edit', compact('payment', 'orders'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'amount' => 'required|numeric',
            'payment_gateway' => 'nullable|string|max:50',
            'payment_date' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $payment->update($validated);
        return redirect()->route('payments.index')->with('success', 'Payment updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully');
    }

    public function pay($orderId)
    {
        $order = Order::findOrFail($orderId);

        $success = rand(0,1);

        if ($success) {
            $order->update(['status' => 'paid']);
            $order->payment->update(['status' => 'success']);

            $qr = QrCode::format('png')->size(200)->generate($order->id);

            Mail::to($order->user->email)->send(new TicketMail($order, $qr));

        } else {
            $order->update(['status' => 'failed']);
            $order->payment->update(['status' => 'failed']);
        }

        return redirect()->route('orders.show', $orderId);
    }

}
