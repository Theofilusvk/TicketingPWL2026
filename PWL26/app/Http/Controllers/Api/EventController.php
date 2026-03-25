<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\TicketType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with(['category', 'organizer', 'ticketTypes'])->get();
        return response()->json(['message' => 'Success listing events', 'data' => $events]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'organizer_id' => 'required|exists:users,user_id',
            'category_id' => 'required|exists:categories,category_id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'location' => 'required|string|max:200',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'status' => 'sometimes|in:active,finished,canceled',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'ticket_types' => 'nullable|array',
            'ticket_types.*.name' => 'required_with:ticket_types|string|max:100',
            'ticket_types.*.price' => 'required_with:ticket_types|numeric|min:0',
            'ticket_types.*.available_stock' => 'required_with:ticket_types|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('banner')) {
                $path = $request->file('banner')->store('banners', 'public');
                $validated['banner_url'] = '/storage/' . $path;
            }

            $event = Event::create($validated);

            if (!empty($validated['ticket_types'])) {
                foreach ($validated['ticket_types'] as $tt) {
                    $event->ticketTypes()->create($tt);
                }
            }

            DB::commit();
            $event->load('ticketTypes');

            return response()->json(['message' => 'Event created successfully', 'data' => $event], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create event', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $event = Event::with(['category', 'organizer', 'ticketTypes'])->find($id);
        if (!$event) return response()->json(['message' => 'Event not found'], 404);

        return response()->json(['message' => 'Success fetching event', 'data' => $event]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) return response()->json(['message' => 'Event not found'], 404);

        $validated = $request->validate([
            'organizer_id' => 'sometimes|required|exists:users,user_id',
            'category_id' => 'sometimes|required|exists:categories,category_id',
            'title' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'location' => 'sometimes|required|string|max:200',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after_or_equal:start_time',
            'status' => 'sometimes|in:active,finished,canceled',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'ticket_types' => 'nullable|array',
            'ticket_types.*.ticket_type_id' => 'nullable|exists:ticket_types,ticket_type_id',
            'ticket_types.*.name' => 'required_with:ticket_types|string|max:100',
            'ticket_types.*.price' => 'required_with:ticket_types|numeric|min:0',
            'ticket_types.*.available_stock' => 'required_with:ticket_types|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('banner')) {
                if ($event->banner_url) {
                    $oldPath = str_replace('/storage/', '', $event->banner_url);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('banner')->store('banners', 'public');
                $validated['banner_url'] = '/storage/' . $path;
            }

            $event->update($validated);

            if (isset($validated['ticket_types'])) {
                foreach ($validated['ticket_types'] as $tt) {
                    if (!empty($tt['ticket_type_id'])) {
                        $ticketType = TicketType::find($tt['ticket_type_id']);
                        if ($ticketType && $ticketType->event_id == $event->event_id) {
                            $ticketType->update([
                                'name' => $tt['name'],
                                'price' => $tt['price'],
                                'available_stock' => $tt['available_stock']
                            ]);
                        }
                    } else {
                        $event->ticketTypes()->create([
                            'name' => $tt['name'],
                            'price' => $tt['price'],
                            'available_stock' => $tt['available_stock']
                        ]);
                    }
                }
            }

            DB::commit();
            $event->load('ticketTypes');

            return response()->json(['message' => 'Event updated successfully', 'data' => $event]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update event', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $event = Event::find($id);
        if (!$event) return response()->json(['message' => 'Event not found'], 404);

        if ($event->banner_url) {
            $oldPath = str_replace('/storage/', '', $event->banner_url);
            Storage::disk('public')->delete($oldPath);
        }

        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
