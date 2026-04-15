<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

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
