<?php

namespace App\Http\Controllers\Api;

use App\Models\EventOrganizer;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EventOrganizerController
{
    /**
     * Organizer self-enrolls to an event
     */
    public function enroll(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'organizer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
        ]);

        $organizerId = Auth::id();

        $existing = EventOrganizer::where('event_id', $validated['event_id'])
            ->where('organizer_id', $organizerId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You are already enrolled into this event'], 422);
        }

        $eventOrganizer = EventOrganizer::create([
            'event_id' => $validated['event_id'],
            'organizer_id' => $organizerId,
            'notes' => 'Self-enrolled',
        ]);

        return response()->json([
            'message' => 'Successfully enrolled to event',
            'data' => $eventOrganizer,
        ], 201);
    }
    /**
     * Assign an organizer to an event (Admin only)
     */
    public function assign(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'organizer_id' => 'required|exists:users,user_id',
            'notes' => 'nullable|string',
        ]);

        // Check if organizer is actually an organizer
        $organizer = \App\Models\User::find($validated['organizer_id']);
        if (!$organizer || $organizer->role !== 'organizer') {
            return response()->json(['message' => 'User is not an organizer'], 422);
        }

        // Check if already assigned
        $existing = EventOrganizer::where('event_id', $validated['event_id'])
            ->where('organizer_id', $validated['organizer_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Organizer already assigned to this event'], 422);
        }

        $eventOrganizer = EventOrganizer::create([
            'event_id' => $validated['event_id'],
            'organizer_id' => $validated['organizer_id'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Organizer assigned successfully',
            'data' => $eventOrganizer->load(['event', 'organizer']),
        ], 201);
    }

    /**
     * Remove organizer from event (Admin only)
     */
    public function unassign(EventOrganizer $eventOrganizer): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $eventOrganizer->delete();

        return response()->json(['message' => 'Organizer removed from event successfully']);
    }

    /**
     * Get events assigned to current organizer (with access check)
     */
    public function myEvents(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'organizer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignments = EventOrganizer::where('organizer_id', $user->user_id)
            ->with('event')
            ->get()
            ->map(function ($assignment) {
                $hasAccess = $assignment->hasAccess();
                $minutesLeft = $assignment->getMinutesUntilEnd();
                $accessDeadline = $assignment->event->getOrganizerAccessDeadline();
                
                return [
                    'event_organizer_id' => $assignment->event_organizer_id,
                    'event_id' => $assignment->event->event_id,
                    'event_title' => $assignment->event->title,
                    'event_start_time' => $assignment->event->start_time,
                    'event_end_time' => $assignment->event->end_time,
                    'organizer_access_until' => $assignment->event->organizer_access_until,
                    'access_deadline' => $accessDeadline, // The actual deadline being used
                    'referral_code' => $assignment->referral_code,
                    'notes' => $assignment->notes,
                    'hasAccess' => $hasAccess,
                    'eventEnded' => $assignment->eventHasEnded(),
                    'minutesUntilEnd' => $minutesLeft,
                    'created_at' => $assignment->created_at,
                ];
            });

        return response()->json($assignments);
    }

    /**
     * Get all assignments for an event (Admin only)
     */
    public function eventAssignments(Event $event): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignments = EventOrganizer::where('event_id', $event->event_id)
            ->with('organizer')
            ->get()
            ->map(function ($assignment) {
                return [
                    'event_organizer_id' => $assignment->event_organizer_id,
                    'organizer_id' => $assignment->organizer->user_id,
                    'organizer_name' => $assignment->organizer->username,
                    'organizer_email' => $assignment->organizer->email,
                    'referral_code' => $assignment->referral_code,
                    'notes' => $assignment->notes,
                    'created_at' => $assignment->created_at,
                ];
            });

        return response()->json($assignments);
    }

    /**
     * Regenerate referral code for an assignment
     */
    public function regenerateCode(EventOrganizer $eventOrganizer): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $eventOrganizer->update([
            'referral_code' => EventOrganizer::generateReferralCode(),
        ]);

        return response()->json([
            'message' => 'Referral code regenerated',
            'referral_code' => $eventOrganizer->referral_code,
        ]);
    }

    /**
     * Get assignment by referral code
     */
    public function getByCode(string $code): JsonResponse
    {
        $assignment = EventOrganizer::where('referral_code', $code)
            ->with(['event', 'organizer'])
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Referral code not found'], 404);
        }

        return response()->json([
            'event_organizer_id' => $assignment->event_organizer_id,
            'event_id' => $assignment->event->event_id,
            'event_title' => $assignment->event->title,
            'organizer_id' => $assignment->organizer->user_id,
            'organizer_name' => $assignment->organizer->username,
            'created_at' => $assignment->created_at,
        ]);
    }
}
