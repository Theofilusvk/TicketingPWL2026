@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row mb-4">
        <div class="col-md-8"><h1>Waiting Lists</h1></div>
        <div class="col-md-4 text-right"><a href="{{ route('waiting-lists.create') }}" class="btn btn-primary">Add to List</a></div>
    </div>
    @if($message = Session::get('success'))<div class="alert alert-success alert-dismissible fade show">{{ $message }}<button type="button" class="close" data-dismiss="alert">×</button></div>@endif
    <div class="card"><div class="table-responsive"><table class="table table-hover mb-0"><thead class="bg-light"><tr><th>ID</th><th>Event</th><th>User</th><th>Status</th><th>Position</th><th style="width: 130px;">Actions</th></tr></thead><tbody>@forelse($lists as $list)<tr><td>#{{ $list->list_id }}</td><td>{{ $list->event->title ?? 'N/A' }}</td><td>{{ $list->user->name ?? 'N/A' }}</td><td><span class="badge badge-warning">{{ $list->status }}</span></td><td>{{ $list->position ?? '-' }}</td><td><a href="{{ route('waiting-lists.show', $list->list_id) }}" class="btn btn-info btn-sm">View</a><a href="{{ route('waiting-lists.edit', $list->list_id) }}" class="btn btn-warning btn-sm">Edit</a><form action="{{ route('waiting-lists.destroy', $list->list_id) }}" method="POST" style="display:inline;">@csrf @method('DELETE')<button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Sure?')">Delete</button></form></td></tr>@empty<tr><td colspan="6" class="text-center py-4">No entries found</td></tr>@endforelse</tbody></table></div></div>
</div>
@endsection
