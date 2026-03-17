@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Waiting List Entry Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $list->list_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Event:</strong></label>
                        <p>{{ $list->event->title ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>User:</strong></label>
                        <p>{{ $list->user->name ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Status:</strong></label>
                        <p><span class="badge badge-warning">{{ $list->status }}</span></p>
                    </div>

                    <div class="form-group">
                        <label><strong>Position:</strong></label>
                        <p>{{ $list->position ?? '-' }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('waiting-lists.edit', $list->list_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('waiting-lists.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('waiting-lists.destroy', $list->list_id) }}" method="POST" style="display:inline;">
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
