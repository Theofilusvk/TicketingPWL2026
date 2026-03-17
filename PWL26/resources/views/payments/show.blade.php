@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Payment Details</h1>
            <hr>

            <div class="card">
                <div class="card-body">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>#{{ $payment->payment_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Order:</strong></label>
                        <p>#{{ $payment->order_id }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Amount:</strong></label>
                        <p>${{ number_format($payment->amount, 2) }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Payment Gateway:</strong></label>
                        <p>{{ $payment->payment_gateway }}</p>
                    </div>

                    <div class="form-group">
                        <label><strong>Payment Date:</strong></label>
                        <p>{{ $payment->payment_date->format('M d, Y H:i') }}</p>
                    </div>

                    <div class="form-group">
                        <a href="{{ route('payments.edit', $payment->payment_id) }}" class="btn btn-warning">Edit</a>
                        <a href="{{ route('payments.index') }}" class="btn btn-secondary">Back</a>
                        <form action="{{ route('payments.destroy', $payment->payment_id) }}" method="POST" style="display:inline;">
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
