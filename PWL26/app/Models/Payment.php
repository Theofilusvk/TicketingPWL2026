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
}
