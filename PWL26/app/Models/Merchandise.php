<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Merchandise extends Model
{
    protected $table = 'merchandise';
    protected $primaryKey = 'merch_id';
    public $timestamps = true;
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'price_usd',
        'price_credits',
        'rarity',
        'available_stock',
        'is_limited',
        'required_tier',
        'category',
        'status'
    ];

    public function orders()
    {
        return $this->hasMany(MerchandiseOrder::class, 'merch_id');
    }
}
