<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'reports';
    protected $primaryKey = 'report_id';
    public $timestamps = true;
    protected $fillable = ['event_id'];
    
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
