<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'order_item_id';
    public $timestamps = false;
    protected $fillable = ['order_id', 'category_id', 'ticket_type', 'quantity'];
    
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
    
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
