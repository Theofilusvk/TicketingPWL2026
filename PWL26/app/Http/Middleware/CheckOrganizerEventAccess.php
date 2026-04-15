<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\EventOrganizer;
use Carbon\Carbon;

class CheckOrganizerEventAccess
{
    /**
     * Handle an incoming request.
     * Check if organizer still has access to the event (event must not have ended)
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the event_id from the request - try multiple possible parameter names
        $eventId = $request->route('eventId') 
                 ?? $request->route('event_id') 
                 ?? $request->route('event')?->id;
        
        if (!$eventId) {
            return $next($request);
        }

        $user = auth()->user();
        
        // Only applies to organizers
        if (!$user || $user->role !== 'organizer') {
            return $next($request);
        }

        // Check if organizer is assigned to this event
        $assignment = EventOrganizer::where('event_id', $eventId)
            ->where('organizer_id', $user->user_id)
            ->first();

        if (!$assignment) {
            return response()->json([
                'message' => 'You are not assigned to this event',
                'status' => 'error'
            ], 403);
        }

        // Check if event has ended
        $event = $assignment->event;
        if (!$event) {
            return response()->json([
                'message' => 'Event not found',
                'status' => 'error'
            ], 404);
        }

        // Use organizer_access_until if set, otherwise use event end_time
        $accessDeadline = $event->getOrganizerAccessDeadline();
        $currentTime = Carbon::now();

        if ($currentTime->isAfter($accessDeadline)) {
            return response()->json([
                'message' => 'Access denied - Organizer scanning deadline has passed',
                'status' => 'error',
                'accessDeadline' => $accessDeadline,
                'accessDenied' => true
            ], 403);
        }

        // Store event info in request for later use
        $request->merge([
            'organizerEventId' => $assignment->event_organizer_id,
            'accessDeadline' => $accessDeadline,
        ]);

        return $next($request);
    }
}
