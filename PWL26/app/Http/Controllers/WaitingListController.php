<?php

namespace App\Http\Controllers;

use App\Models\WaitingList;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;

class WaitingListController extends Controller
{
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
