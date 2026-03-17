@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Category Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>{{ $category->category_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Name:</strong></label>
                        <p>{{ $category->name }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Description:</strong></label>
                        <p>{{ $category->description ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Created At:</strong></label>
                        <p>{{ $category->created_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Updated At:</strong></label>
                        <p>{{ $category->updated_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('categories.edit', $category->category_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('categories.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('categories.destroy', $category->category_id) }}" method="POST" style="display:inline;">
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
