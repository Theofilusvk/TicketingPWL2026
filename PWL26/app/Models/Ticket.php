<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $table = 'tickets';
    protected $primaryKey = 'ticket_id';
    public $timestamps = false;
    
    protected $fillable = [
        'order_item_id',
        'section_id',
        'unique_code',
        'qr_code_path',
        'status',
        'checked_in_at'
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id', 'order_item_id');
    }

    public function section()
    {
        return $this->belongsTo(VenueSection::class, 'section_id', 'section_id');
    }

    public function transfers()
    {
        return $this->hasMany(TicketTransfer::class, 'ticket_id', 'ticket_id');
    }
}
