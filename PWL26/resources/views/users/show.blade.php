@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>User Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>{{ $user->id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Name:</strong></label>
                        <p>{{ $user->name }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Email:</strong></label>
                        <p>{{ $user->email }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Email Verified:</strong></label>
                        <p>{{ $user->email_verified_at ? $user->email_verified_at->format('d M Y H:i') : 'Not verified' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Created At:</strong></label>
                        <p>{{ $user->created_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Updated At:</strong></label>
                        <p>{{ $user->updated_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('users.edit', $user->id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('users.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('users.destroy', $user->id) }}" method="POST" style="display:inline;">
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
