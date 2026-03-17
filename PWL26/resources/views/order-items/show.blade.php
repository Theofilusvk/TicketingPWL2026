@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Order Item Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $item->order_item_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Order:</strong></label>
                        <p>#{{ $item->order_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Category:</strong></label>
                        <p>{{ $item->category->name ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Ticket Type:</strong></label>
                        <p><span class="badge badge-info">{{ $item->ticket_type }}</span></p>
                    </div>

                    <div class="form-group">
                        <label><strong>Quantity:</strong></label>
                        <p>{{ $item->quantity }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('order-items.edit', $item->order_item_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('order-items.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('order-items.destroy', $item->order_item_id) }}" method="POST" style="display:inline;">
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
