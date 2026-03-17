@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row mb-4">
        <div class="col-md-8"><h1>Reports</h1></div>
        <div class="col-md-4 text-right"><a href="{{ route('reports.create') }}" class="btn btn-primary">New Report</a></div>
    </div>
    @if($message = Session::get('success'))<div class="alert alert-success alert-dismissible fade show">{{ $message }}<button type="button" class="close" data-dismiss="alert">×</button></div>@endif
    <div class="card"><div class="table-responsive"><table class="table table-hover mb-0"><thead class="bg-light"><tr><th>ID</th><th>Event</th><th>Type</th><th>Created</th><th style="width: 130px;">Actions</th></tr></thead><tbody>@forelse($reports as $report)<tr><td>#{{ $report->report_id }}</td><td>{{ $report->event->title ?? 'N/A' }}</td><td>{{ $report->report_type ?? 'General' }}</td><td>{{ $report->created_at->format('M d, Y') }}</td><td><a href="{{ route('reports.show', $report->report_id) }}" class="btn btn-info btn-sm">View</a><a href="{{ route('reports.edit', $report->report_id) }}" class="btn btn-warning btn-sm">Edit</a><form action="{{ route('reports.destroy', $report->report_id) }}" method="POST" style="display:inline;">@csrf @method('DELETE')<button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Sure?')">Delete</button></form></td></tr>@empty<tr><td colspan="5" class="text-center py-4">No reports found</td></tr>@endforelse</tbody></table></div></div>
</div>
@endsection
