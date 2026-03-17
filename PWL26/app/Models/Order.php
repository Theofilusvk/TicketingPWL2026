<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    public $timestamps = true;
    protected $fillable = ['user_id', 'event_id', 'status', 'payment_method', 'payment_reference', 'price'];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
    
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
