<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class News extends Model
{
    protected $table = 'news';
    protected $primaryKey = 'news_id';
    public $timestamps = true;

    protected $fillable = [
        'author_id',
        'title',
        'content',
        'tag',
        'urgency',
        'image_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that authored the news
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'user_id');
    }

    /**
     * Scope: Only published news
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderBy('published_at', 'desc');
    }

    /**
     * Scope: Recent news
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('published_at', '>=', now()->subDays($days));
    }
}
