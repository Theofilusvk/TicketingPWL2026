@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Order Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $order->order_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>User:</strong></label>
                        <p>{{ $order->user->name ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Event:</strong></label>
                        <p>#{{ $order->event_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Status:</strong></label>
                        <p><span class="badge badge-{{ $order->status == 'completed' ? 'success' : 'warning' }}">{{ $order->status }}</span></p>
                    </div>

                    <div class="form-group">
                        <label><strong>Price:</strong></label>
                        <p>Rp {{ number_format($order->price, 0, ',', '.') }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Payment Method:</strong></label>
                        <p>{{ $order->payment_method ?? 'N/A' }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Created At:</strong></label>
                        <p>{{ $order->created_at->format('d M Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('orders.edit', $order->order_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('orders.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('orders.destroy', $order->order_id) }}" method="POST" style="display:inline;">
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
