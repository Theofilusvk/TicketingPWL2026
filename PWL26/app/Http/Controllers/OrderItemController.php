<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(OrderItem::with(['order', 'category'])->get());
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
            'category_id' => 'required|exists:categories,category_id',
            'ticket_type' => 'required|in:regular,vip,premium',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = OrderItem::create($validated);
        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $item = OrderItem::with(['order', 'category'])->find($id);
        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }
        return response()->json($item);
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
        $item = OrderItem::find($id);
        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'category_id' => 'required|exists:categories,category_id',
            'ticket_type' => 'required|in:regular,vip,premium',
            'quantity' => 'required|integer|min:1',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = OrderItem::find($id);
        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }

        $item->delete();
        return response()->json(['message' => 'Order item deleted']);
    }
}
