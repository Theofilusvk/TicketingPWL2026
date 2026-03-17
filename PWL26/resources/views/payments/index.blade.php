@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row mb-4">
        <div class="col-md-8"><h1>Payments</h1></div>
        <div class="col-md-4 text-right"><a href="{{ route('payments.create') }}" class="btn btn-primary">Add Payment</a></div>
    </div>
    @if($message = Session::get('success'))<div class="alert alert-success alert-dismissible fade show">{{ $message }}<button type="button" class="close" data-dismiss="alert">×</button></div>@endif
    <div class="card"><div class="table-responsive"><table class="table table-hover mb-0"><thead class="bg-light"><tr><th>ID</th><th>Order</th><th>Amount</th><th>Gateway</th><th>Date</th><th style="width: 130px;">Actions</th></tr></thead><tbody>@forelse($payments as $payment)<tr><td>#{{ $payment->payment_id }}</td><td>#{{ $payment->order_id }}</td><td>${{ number_format($payment->amount, 2) }}</td><td>{{ $payment->payment_gateway }}</td><td>{{ $payment->payment_date->format('M d, Y') }}</td><td><a href="{{ route('payments.show', $payment->payment_id) }}" class="btn btn-info btn-sm">View</a><a href="{{ route('payments.edit', $payment->payment_id) }}" class="btn btn-warning btn-sm">Edit</a><form action="{{ route('payments.destroy', $payment->payment_id) }}" method="POST" style="display:inline;">@csrf @method('DELETE')<button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Sure?')">Delete</button></form></td></tr>@empty<tr><td colspan="6" class="text-center py-4">No payments found</td></tr>@endforelse</tbody></table></div></div>
</div>
@endsection
