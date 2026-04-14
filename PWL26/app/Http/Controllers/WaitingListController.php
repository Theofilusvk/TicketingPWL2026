<?php

namespace App\Http\Controllers;

use App\Models\WaitingList;
use App\Models\Event;
use App\Models\User;
use App\Models\TicketType;
use App\Services\TicketingService;
use Illuminate\Http\Request;

class WaitingListController extends Controller
{
    protected $ticketingService;

    public function __construct(TicketingService $ticketingService)
    {
        $this->ticketingService = $ticketingService;
    }

    /**
     * Get waiting list for event
     */
    public function byEvent(Event $event)
    {
        $waitingList = WaitingList::where('event_id', $event->event_id)
            ->where('status', 'waiting')
            ->with(['user', 'ticketType'])
            ->orderBy('queue_position')
            ->get();

        return response()->json([
            'event_id' => $event->event_id,
            'total_waiting' => $waitingList->count(),
            'list' => $waitingList,
        ]);
    }

    /**
     * Get user's waiting list entries
     */
    public function myWaitingList()
    {
        $userId = auth()->id();

        $waitingList = WaitingList::where('user_id', $userId)
            ->with(['event', 'ticketType'])
            ->where('status', '!=', 'expired')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($waitingList);
    }

    /**
     * Add user to waiting list
     */
    public function joinWaitingList(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'ticket_type_id' => 'required|exists:ticket_types,ticket_type_id',
            'preferred_price' => 'nullable|numeric|min:0',
        ]);

        $event = Event::findOrFail($validated['event_id']);

        // Check if event is not sold out
        if ($event->isSoldOut()) {
            // Add to waiting list
            $entry = $this->ticketingService->addToWaitingList(
                auth()->id(),
                $validated['event_id'],
                $validated['ticket_type_id'],
                $validated['preferred_price']
            );

            return response()->json([
                'message' => 'Added to waiting list',
                'queue_position' => $entry->queue_position,
                'entry' => $entry,
            ], 201);
        }

        return response()->json(['error' => 'Event not sold out'], 400);
    }

    /**
     * Leave waiting list
     */
    public function leaveWaitingList(Request $request)
    {
        $validated = $request->validate([
            'list_id' => 'required|exists:waiting_list,list_id',
        ]);

        $entry = WaitingList::findOrFail($validated['list_id']);

        if ($entry->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($entry->status !== 'waiting') {
            return response()->json(['error' => 'Cannot leave this waiting list entry'], 400);
        }

        $entry->update(['status' => 'expired']);

        return response()->json(['message' => 'Left waiting list']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $waitingLists = WaitingList::with(['event', 'user'])->get();
        return view('waiting-lists.index', compact('waitingLists'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $events = Event::all();
        $users = User::all();
        return view('waiting-lists.create', compact('events', 'users'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|max:50',
        ]);

        WaitingList::create($validated);
        return redirect()->route('waiting-lists.index')->with('success', 'Waiting list entry created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $waitingList = WaitingList::with(['event', 'user'])->findOrFail($id);
        return view('waiting-lists.show', compact('waitingList'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $waitingList = WaitingList::findOrFail($id);
        $events = Event::all();
        $users = User::all();
        return view('waiting-lists.edit', compact('waitingList', 'events', 'users'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $waitingList = WaitingList::findOrFail($id);

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|max:50',
        ]);

        $waitingList->update($validated);
        return redirect()->route('waiting-lists.index')->with('success', 'Waiting list entry updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $waitingList = WaitingList::findOrFail($id);
        $waitingList->delete();
        
        return redirect()->route('waiting-lists.index')->with('success', 'Waiting list entry deleted successfully');
    }
}
