<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'events';
    protected $primaryKey = 'event_id';
    public $timestamps = false;
    protected $fillable = [
        'organizer_id', 
        'category_id', 
        'title', 
        'description', 
        'banner_url', 
        'location', 
        'start_time', 
        'end_time', 
        'organizer_access_until',
        'status'
    ];
    
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function ticketTypes()
    {
        return $this->hasMany(TicketType::class, 'event_id', 'event_id');
    }

    public function venueSections()
    {
        return $this->hasMany(VenueSection::class, 'event_id', 'event_id');
    }

    public function waitingLists()
    {
        return $this->hasMany(WaitingList::class, 'event_id', 'event_id');
    }

    // Check if event is sold out
    public function isSoldOut()
    {
        if (!$this->venue_capacity) {
            return false;
        }
        return $this->total_sold >= $this->venue_capacity;
    }

    // Get available capacity
    public function getAvailableCapacityAttribute()
    {
        return $this->venue_capacity ? max(0, $this->venue_capacity - $this->total_sold) : 0;
    }

    // Get the actual organizer access deadline (use organizer_access_until if set, else use end_time)
    public function getOrganizerAccessDeadline()
    {
        return $this->organizer_access_until ?? $this->end_time;
    }

    // Check if organizer access has expired
    public function hasOrganizerAccessExpired()
    {
        $deadline = $this->getOrganizerAccessDeadline();
        return \Carbon\Carbon::now()->isAfter($deadline);
    }

    // Get minutes until organizer access expires
    public function getMinutesUntilOrganizerAccessExpires()
    {
        $deadline = $this->getOrganizerAccessDeadline();
        $diff = \Carbon\Carbon::now()->diffInMinutes($deadline, false);
        return max(0, $diff);
    }
}
