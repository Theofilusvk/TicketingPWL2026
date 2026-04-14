<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueSection extends Model
{
    protected $table = 'venue_sections';
    protected $primaryKey = 'section_id';
    public $timestamps = true;

    protected $fillable = [
        'event_id',
        'section_name',
        'capacity',
        'price',
        'sold_tickets',
        'map_position',
        'status'
    ];

    protected $casts = [
        'map_position' => 'array',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'section_id', 'section_id');
    }

    // Calculate available tickets
    public function getAvailableTicketsAttribute()
    {
        return $this->capacity - $this->sold_tickets;
    }

    // Check if section is sold out
    public function isSoldOut()
    {
        return $this->sold_tickets >= $this->capacity;
    }
}
