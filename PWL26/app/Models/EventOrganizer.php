<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventOrganizer extends Model
{
    protected $table = 'event_organizers';
    protected $primaryKey = 'event_organizer_id';
    public $timestamps = true;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'referral_code',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the event associated with this organizer assignment
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    /**
     * Get the organizer user
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id', 'user_id');
    }

    /**
     * Check if organizer still has access to this event
     * Uses organizer_access_until if set, otherwise uses event end_time
     */
    public function hasAccess(): bool
    {
        if (!$this->event) {
            return false;
        }

        return !$this->event->hasOrganizerAccessExpired();
    }

    /**
     * Get the remaining time until organizer access expires
     * Uses organizer_access_until if set, otherwise uses event end_time
     */
    public function getRemainingTime()
    {
        if (!$this->event) {
            return null;
        }

        $deadline = $this->event->getOrganizerAccessDeadline();
        $currentTime = Carbon::now();

        if ($currentTime->isAfter($deadline)) {
            return null;
        }

        return $deadline->diff($currentTime);
    }

    /**
     * Check if organizer access has expired
     * Uses organizer_access_until if set, otherwise uses event end_time
     */
    public function eventHasEnded(): bool
    {
        if (!$this->event) {
            return false;
        }

        return $this->event->hasOrganizerAccessExpired();
    }

    /**
     * Get time until organizer access expires (in minutes)
     * Uses organizer_access_until if set, otherwise uses event end_time
     */
    public function getMinutesUntilEnd(): int
    {
        if (!$this->event) {
            return 0;
        }

        return $this->event->getMinutesUntilOrganizerAccessExpires();
    }

    /**
     * Generate a unique referral code
     */
    public static function generateReferralCode(): string
    {
        do {
            $code = 'ORG-' . strtoupper(Str::random(8));
        } while (self::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Boot method to auto-generate referral code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->referral_code) {
                $model->referral_code = self::generateReferralCode();
            }
        });
    }
}
