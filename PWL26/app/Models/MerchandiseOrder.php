<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiseOrder extends Model
{
    protected $table = 'merchandise_orders';
    protected $primaryKey = 'merch_order_id';
    public $timestamps = true;
    protected $fillable = [
        'user_id',
        'merch_id',
        'quantity',
        'payment_type',
        'amount_credits',
        'amount_money',
        'status',
        'shipping_address',
        'tracking_number'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function merchandise()
    {
        return $this->belongsTo(Merchandise::class, 'merch_id');
    }
}
