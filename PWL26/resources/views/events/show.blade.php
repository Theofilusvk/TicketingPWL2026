@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Event Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $event->event_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Organizer:</strong></label>
                        <p>{{ $event->organizer->name ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Created At:</strong></label>
                        <p>{{ $event->created_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Updated At:</strong></label>
                        <p>{{ $event->updated_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('events.edit', $event->event_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('events.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('events.destroy', $event->event_id) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure?')">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
