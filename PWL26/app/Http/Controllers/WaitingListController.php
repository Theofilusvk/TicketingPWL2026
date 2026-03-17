<?php

namespace App\Http\Controllers;

use App\Models\WaitingList;
use Illuminate\Http\Request;

class WaitingListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(WaitingList::with(['event', 'user'])->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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

        $listEntry = WaitingList::create($validated);
        return response()->json($listEntry, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $listEntry = WaitingList::with(['event', 'user'])->find($id);
        if (!$listEntry) {
            return response()->json(['message' => 'Waiting list entry not found'], 404);
        }
        return response()->json($listEntry);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $listEntry = WaitingList::find($id);
        if (!$listEntry) {
            return response()->json(['message' => 'Waiting list entry not found'], 404);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|max:50',
        ]);

        $listEntry->update($validated);
        return response()->json($listEntry);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $listEntry = WaitingList::find($id);
        if (!$listEntry) {
            return response()->json(['message' => 'Waiting list entry not found'], 404);
        }

        $listEntry->delete();
        return response()->json(['message' => 'Waiting list entry deleted']);
    }
}
