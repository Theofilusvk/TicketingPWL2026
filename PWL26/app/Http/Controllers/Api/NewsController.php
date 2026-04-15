<?php

namespace App\Http\Controllers\Api;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NewsController
{
    /**
     * Get all published news
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $tag = $request->input('tag');
        $search = $request->input('search');

        $query = News::published();

        if ($tag) {
            $query->where('tag', $tag);
        }

        if ($search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
        }

        $news = $query->paginate($perPage);

        return response()->json($news);
    }

    /**
     * Get recent news
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $days = $request->input('days', 30);

        $news = News::published()
            ->recent($days)
            ->limit($limit)
            ->get();

        return response()->json($news);
    }

    /**
     * Show single news article
     */
    public function show(News $news): JsonResponse
    {
        if (!$news->is_published) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($news->load('author'));
    }

    /**
     * Admin: Create news article
     */
    public function createAdmin(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'tag' => 'nullable|string|max:50',
            'urgency' => 'nullable|in:NORMAL,HIGH,CRITICAL',
            'image_url' => 'nullable|string',
            'event_id' => 'nullable|exists:events,event_id',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $news = News::create([
            'author_id' => Auth::id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'tag' => $validated['tag'] ?? 'SYSTEM',
            'urgency' => $validated['urgency'] ?? 'NORMAL',
            'image_url' => $validated['image_url'] ?? null,
            'event_id' => $validated['event_id'] ?? null,
            'is_published' => $validated['is_published'] ?? true,
            'published_at' => $validated['published_at'] ?? now(),
        ]);

        return response()->json([
            'message' => 'News created successfully',
            'news' => $news,
        ], 201);
    }

    /**
     * Admin: Update news article
     */
    public function updateAdmin(Request $request, News $news): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'tag' => 'sometimes|string|max:50',
            'urgency' => 'sometimes|in:NORMAL,HIGH,CRITICAL',
            'image_url' => 'sometimes|nullable|string',
            'event_id' => 'sometimes|nullable|exists:events,event_id',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'sometimes|nullable|date_format:Y-m-d H:i:s',
        ]);

        $news->update($validated);

        return response()->json([
            'message' => 'News updated successfully',
            'news' => $news,
        ]);
    }

    /**
     * Admin: Delete news article
     */
    public function destroyAdmin(News $news): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $news->delete();

        return response()->json(['message' => 'News deleted successfully']);
    }

    /**
     * Admin: Get all news (including unpublished)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 20);
        $tag = $request->input('tag');

        $query = News::with('author')
            ->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc');

        if ($tag) {
            $query->where('tag', $tag);
        }

        $news = $query->paginate($perPage);

        return response()->json($news);
    }

    /**
     * Get available tags
     */
    public function tags(): JsonResponse
    {
        $tags = News::distinct('tag')
            ->pluck('tag')
            ->filter()
            ->values();

        return response()->json($tags);
    }
}
