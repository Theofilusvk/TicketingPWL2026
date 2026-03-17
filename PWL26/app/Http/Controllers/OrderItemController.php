<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = OrderItem::with(['order', 'category'])->get();
        return view('order-items.index', compact('items'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $orders = Order::all();
        $categories = Category::all();
        return view('order-items.create', compact('orders', 'categories'));
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

        OrderItem::create($validated);
        return redirect()->route('order-items.index')->with('success', 'Order item created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $item = OrderItem::with(['order', 'category'])->findOrFail($id);
        return view('order-items.show', compact('item'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $item = OrderItem::findOrFail($id);
        $orders = Order::all();
        $categories = Category::all();
        return view('order-items.edit', compact('item', 'orders', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = OrderItem::findOrFail($id);

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'category_id' => 'required|exists:categories,category_id',
            'ticket_type' => 'required|in:regular,vip,premium',
            'quantity' => 'required|integer|min:1',
        ]);

        $item->update($validated);
        return redirect()->route('order-items.index')->with('success', 'Order item updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = OrderItem::findOrFail($id);
        $item->delete();
        
        return redirect()->route('order-items.index')->with('success', 'Order item deleted successfully');
    }
}
