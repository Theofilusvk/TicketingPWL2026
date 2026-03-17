@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row mb-4">
        <div class="col-md-8"><h1>Order Items</h1></div>
        <div class="col-md-4 text-right"><a href="{{ route('order-items.create') }}" class="btn btn-primary">Add Item</a></div>
    </div>
    @if($message = Session::get('success'))<div class="alert alert-success alert-dismissible fade show">{{ $message }}<button type="button" class="close" data-dismiss="alert">×</button></div>@endif
    <div class="card"><div class="table-responsive"><table class="table table-hover mb-0"><thead class="bg-light"><tr><th>ID</th><th>Order</th><th>Category</th><th>Type</th><th>Qty</th><th style="width: 130px;">Actions</th></tr></thead><tbody>@forelse($items as $item)<tr><td>#{{ $item->order_item_id }}</td><td>#{{ $item->order_id }}</td><td>{{ $item->category->name ?? 'N/A' }}</td><td><span class="badge badge-info">{{ $item->ticket_type }}</span></td><td>{{ $item->quantity }}</td><td><a href="{{ route('order-items.show', $item->order_item_id) }}" class="btn btn-info btn-sm">View</a><a href="{{ route('order-items.edit', $item->order_item_id) }}" class="btn btn-warning btn-sm">Edit</a><form action="{{ route('order-items.destroy', $item->order_item_id) }}" method="POST" style="display:inline;">@csrf @method('DELETE')<button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Sure?')">Delete</button></form></td></tr>@empty<tr><td colspan="6" class="text-center py-4">No items found</td></tr>@endforelse</tbody></table></div></div>
</div>
@endsection
