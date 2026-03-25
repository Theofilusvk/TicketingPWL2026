<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    protected $table = 'ticket_types';
    protected $primaryKey = 'ticket_type_id';
    public $timestamps = true;
    protected $fillable = ['event_id', 'name', 'price', 'available_stock'];
    
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function waitingLists()
    {
        return $this->hasMany(WaitingList::class, 'ticket_type_id');
    }
}
