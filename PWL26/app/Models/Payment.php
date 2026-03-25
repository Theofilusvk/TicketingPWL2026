<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $timestamps = true;
    protected $fillable = ['order_id', 'amount', 'payment_gateway', 'payment_date'];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function pay($orderId)
    {
        $order = Order::findOrFail($orderId);

        $success = rand(0,1);

        if ($success) {
            $order->update(['status' => 'paid']);
            $order->payment->update(['status' => 'success']);
        } else {
            $order->update(['status' => 'failed']);
            $order->payment->update(['status' => 'failed']);
        }

        return redirect()->route('orders.show', $orderId);
    }
}
