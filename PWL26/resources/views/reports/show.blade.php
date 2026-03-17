@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Report Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $report->report_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Event:</strong></label>
                        <p>{{ $report->event->title ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Report Type:</strong></label>
                        <p>{{ $report->report_type ?? 'General' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Description:</strong></label>
                        <p>{{ $report->description ?? 'No description' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Created:</strong></label>
                        <p>{{ $report->created_at->format('M d, Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('reports.edit', $report->report_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('reports.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('reports.destroy', $report->report_id) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Sure?')">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
