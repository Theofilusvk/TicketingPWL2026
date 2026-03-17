<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Event;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reports = Report::with('event')->get();
        return view('reports.index', compact('reports'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $events = Event::all();
        return view('reports.create', compact('events'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
        ]);

        Report::create($validated);
        return redirect()->route('reports.index')->with('success', 'Report created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = Report::with('event')->findOrFail($id);
        return view('reports.show', compact('report'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $report = Report::findOrFail($id);
        $events = Event::all();
        return view('reports.edit', compact('report', 'events'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $report = Report::findOrFail($id);

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
        ]);

        $report->update($validated);
        return redirect()->route('reports.index')->with('success', 'Report updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        
        return redirect()->route('reports.index')->with('success', 'Report deleted successfully');
    }
}
