<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Report::with('event')->get());
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
        ]);

        $report = Report::create($validated);
        return response()->json($report, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = Report::with('event')->find($id);
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }
        return response()->json($report);
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
        $report = Report::find($id);
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,event_id',
        ]);

        $report->update($validated);
        return response()->json($report);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->delete();
        return response()->json(['message' => 'Report deleted']);
    }
}
