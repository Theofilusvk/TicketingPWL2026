<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketTransfer extends Model
{
    protected $table = 'ticket_transfers';
    protected $primaryKey = 'transfer_id';
    public $timestamps = true;

    protected $fillable = [
        'ticket_id',
        'from_user_id',
        'to_user_id',
        'type',
        'transfer_price',
        'reason',
        'status',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'ticket_id');
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id', 'user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id', 'user_id');
    }

    // Check if transfer offer is expired
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
