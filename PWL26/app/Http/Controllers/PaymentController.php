<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Payment::with('order')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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

        $payment = Payment::create($validated);
        return response()->json($payment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payment = Payment::with('order')->find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }
        return response()->json($payment);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'amount' => 'required|numeric',
            'payment_gateway' => 'nullable|string|max:50',
            'payment_date' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $payment->update($validated);
        return response()->json($payment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->delete();
        return response()->json(['message' => 'Payment deleted']);
    }
}
