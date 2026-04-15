<?php

namespace App\Http\Controllers;

use App\Models\VenueSection;
use App\Models\Event;
use Illuminate\Http\Request;

class VenueSectionController extends Controller
{
    /**
     * Get all sections for an event
     */
    public function byEvent(Event $event)
    {
        $sections = VenueSection::where('event_id', $event->event_id)
            ->orderBy('section_name')
            ->get();

        return response()->json($sections);
    }

    /**
     * Create a venue section
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'section_name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'map_position' => 'nullable|array',
            'status' => 'nullable|in:active,inactive,hidden',
        ]);

        $event = Event::findOrFail($validated['event_id']);

        // Check authorization (only organizer or admin)
        if (auth()->id() != $event->organizer_id && auth()->user()->role != 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $section = VenueSection::create([
            'event_id' => $validated['event_id'],
            'section_name' => $validated['section_name'],
            'capacity' => $validated['capacity'],
            'price' => $validated['price'],
            'map_position' => $validated['map_position'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Update event capacity if needed
        $totalCapacity = VenueSection::where('event_id', $validated['event_id'])
            ->sum('capacity');
        $event->update(['venue_capacity' => $totalCapacity]);

        return response()->json($section, 201);
    }

    /**
     * Update venue section
     */
    public function update(Request $request, VenueSection $section)
    {
        $event = $section->event;

        // Check authorization
        if (auth()->id() != $event->organizer_id && auth()->user()->role != 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'section_name' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'map_position' => 'nullable|array',
            'status' => 'nullable|in:active,inactive,hidden',
        ]);

        $section->update($validated);

        // Update event capacity
        $totalCapacity = VenueSection::where('event_id', $event->event_id)
            ->sum('capacity');
        $event->update(['venue_capacity' => $totalCapacity]);

        return response()->json($section);
    }

    /**
     * Delete venue section
     */
    public function destroy(VenueSection $section)
    {
        $event = $section->event;

        // Check authorization
        if (auth()->id() != $event->organizer_id && auth()->user()->role != 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Cannot delete if has sold tickets
        if ($section->sold_tickets > 0) {
            return response()->json(['error' => 'Cannot delete section with sold tickets'], 400);
        }

        $section->delete();

        // Update event capacity
        $totalCapacity = VenueSection::where('event_id', $event->event_id)
            ->sum('capacity');
        $event->update(['venue_capacity' => $totalCapacity]);

        return response()->json(['message' => 'Section deleted successfully']);
    }

    /**
     * Get venue map data for event
     */
    public function getVenueMap(Event $event)
    {
        $sections = VenueSection::where('event_id', $event->event_id)
            ->where('status', '!=', 'hidden')
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->section_id,
                    'name' => $section->section_name,
                    'capacity' => $section->capacity,
                    'sold' => $section->sold_tickets,
                    'available' => $section->available_tickets,
                    'price' => $section->price,
                    'position' => $section->map_position,
                    'isSoldOut' => $section->isSoldOut(),
                    'occupancy' => round(($section->sold_tickets / $section->capacity) * 100, 2),
                ];
            });

        return response()->json([
            'event_id' => $event->event_id,
            'total_capacity' => $event->venue_capacity,
            'total_sold' => $event->total_sold,
            'sections' => $sections,
        ]);
    }
}
