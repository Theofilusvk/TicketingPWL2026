<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'events';
    protected $primaryKey = 'event_id';
    public $timestamps = true;
    protected $fillable = ['organizer_id'];
    
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }
}
