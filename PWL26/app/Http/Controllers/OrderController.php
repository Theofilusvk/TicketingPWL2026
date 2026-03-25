<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Event;
use App\Models\WaitingList;
use App\Models\Payment;


class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::with(['user', 'event', 'items'])->get();
        return view('orders.index', compact('orders'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all();
        $events = Event::all();
        return view('orders.create', compact('users', 'events'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_id' => 'required|exists:events,event_id',
            'status' => 'required|in:pending,completed,cancelled',
            'payment_method' => 'nullable|string|max:50',
            'payment_reference' => 'nullable|string|max:100',
            'price' => 'required|numeric',
        ]);

        Order::create($validated);
        return redirect()->route('orders.index')->with('success', 'Order created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = Order::with(['user', 'event', 'items'])->findOrFail($id);
        return view('orders.show', compact('order'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $order = Order::findOrFail($id);
        $users = User::all();
        $events = Event::all();
        return view('orders.edit', compact('order', 'users', 'events'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_id' => 'required|exists:events,event_id',
            'status' => 'required|in:pending,completed,cancelled',
            'payment_method' => 'nullable|string|max:50',
            'payment_reference' => 'nullable|string|max:100',
            'price' => 'required|numeric',
        ]);

        $order->update($validated);
        return redirect()->route('orders.index')->with('success', 'Order updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully');
    }


    use Illuminate\Support\Facades\DB;
    use App\Models\Order;
    use App\Models\OrderItem;
    use App\Models\Event;
    use App\Models\WaitingList;
    use App\Models\Payment;

    public function checkout(Request $request)
    {
        DB::beginTransaction();

        try {
            $total = 0;

            // 1. Buat order
            $order = Order::create([
                'user_id' => auth()->id(),
                'status' => 'pending',
                'total_price' => 0
            ]);

            // 2. Loop tiket yang dibeli
            foreach ($request->items as $item) {

                $event = Event::find($item['event_id']);

                // Kalau stok tidak cukup
                if ($event->stock < $item['qty']) {

                    // masuk waiting list
                    WaitingList::create([
                        'user_id' => auth()->id(),
                        'event_id' => $event->id
                    ]);

                    continue;
                }

                // Kurangi stok
                $event->decrement('stock', $item['qty']);

                // Simpan item
                OrderItem::create([
                    'order_id' => $order->id,
                    'event_id' => $event->id,
                    'qty' => $item['qty'],
                    'price' => $event->price
                ]);

                $total += $event->price * $item['qty'];
            }

            // 3. Update total harga
            $order->update([
                'total_price' => $total
            ]);

            // 4. Buat payment
            Payment::create([
                'order_id' => $order->id,
                'status' => 'pending'
            ]);

            DB::commit();

            return redirect()->route('payments.show', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
