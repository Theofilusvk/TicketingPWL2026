@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row mb-4">
        <div class="col-md-12">
            <h1>Ticketing System Management</h1>
            <hr>
        </div>
    </div>

    <!-- Navigation Menu -->
    <div class="row mb-5">
        <div class="col-md-12">
            <nav class="navbar navbar-expand-lg navbar-light bg-light border rounded">
                <div class="container-fluid">
                    <span class="navbar-brand mb-0 h5">Quick Access</span>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ml-auto">
                            <li class="nav-item"><a class="nav-link" href="{{ route('users.index') }}">👥 Users</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('categories.index') }}">📂 Categories</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('events.index') }}">🎉 Events</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('orders.index') }}">🛒 Orders</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('order-items.index') }}">🎫 Order Items</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('payments.index') }}">💳 Payments</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('waiting-lists.index') }}">⏱️ Waiting List</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('reports.index') }}">📊 Reports</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <!-- Users Section -->
    <div class="row mb-5">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">Users</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('users.create') }}" class="btn btn-success btn-sm mb-3">Add User</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($users ?? [] as $user)
                                <tr>
                                    <td>{{ $user->name }}</td>
                                    <td>{{ $user->email }}</td>
                                    <td>
                                        <a href="{{ route('users.show', $user->id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('users.edit', $user->id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('users.destroy', $user->id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-center">No users</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('users.index') }}" class="btn btn-primary btn-sm mt-3">View All Users</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories & Events Section -->
    <div class="row mb-5">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Categories</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('categories.create') }}" class="btn btn-success btn-sm mb-3">Add Category</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($categories ?? [] as $category)
                                <tr>
                                    <td>{{ $category->name }}</td>
                                    <td>
                                        <a href="{{ route('categories.show', $category->category_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('categories.edit', $category->category_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('categories.destroy', $category->category_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="2" class="text-center">No categories</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('categories.index') }}" class="btn btn-primary btn-sm mt-3">View All Categories</a>
                </div>
            </div>
        </div>

        <!-- Events Section -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">Events</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('events.create') }}" class="btn btn-success btn-sm mb-3">Add Event</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($events ?? [] as $event)
                                <tr>
                                    <td>#{{ $event->event_id }}</td>
                                    <td>
                                        <a href="{{ route('events.show', $event->event_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('events.edit', $event->event_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('events.destroy', $event->event_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="2" class="text-center">No events</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('events.index') }}" class="btn btn-primary btn-sm mt-3">View All Events</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Orders & Payments Section -->
    <div class="row mb-5">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-danger text-white">
                    <h5 class="mb-0">Orders</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('orders.create') }}" class="btn btn-success btn-sm mb-3">Add Order</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($orders ?? [] as $order)
                                <tr>
                                    <td>#{{ $order->order_id }}</td>
                                    <td><span class="badge badge-{{ $order->status == 'completed' ? 'success' : 'warning' }}">{{ $order->status }}</span></td>
                                    <td>
                                        <a href="{{ route('orders.show', $order->order_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('orders.edit', $order->order_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('orders.destroy', $order->order_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-center">No orders</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('orders.index') }}" class="btn btn-primary btn-sm mt-3">View All Orders</a>
                </div>
            </div>
        </div>

        <!-- Payments Section -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">Payments</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('payments.create') }}" class="btn btn-success btn-sm mb-3">Add Payment</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($payments ?? [] as $payment)
                                <tr>
                                    <td>#{{ $payment->payment_id }}</td>
                                    <td>Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                                    <td>
                                        <a href="{{ route('payments.show', $payment->payment_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('payments.edit', $payment->payment_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('payments.destroy', $payment->payment_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-center">No payments</td></tr>
                            @endforelse
                        </tbody>
                    </table>                    <a href="{{ route('payments.index') }}" class="btn btn-primary btn-sm mt-3">View All Payments</a>                </div>
            </div>
        </div>
    </div>

    <!-- Order Items Section -->
    <div class="row mb-5">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">Order Items</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('order-items.create') }}" class="btn btn-success btn-sm mb-3">Add Order Item</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Order</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Qty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($items ?? [] as $item)
                                <tr>
                                    <td>#{{ $item->order_item_id }}</td>
                                    <td>#{{ $item->order_id }}</td>
                                    <td>{{ $item->category->name ?? 'N/A' }}</td>
                                    <td><span class="badge badge-secondary">{{ $item->ticket_type }}</span></td>
                                    <td>{{ $item->quantity }}</td>
                                    <td>
                                        <a href="{{ route('order-items.show', $item->order_item_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('order-items.edit', $item->order_item_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('order-items.destroy', $item->order_item_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="6" class="text-center">No order items</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('order-items.index') }}" class="btn btn-primary btn-sm mt-3">View All Order Items</a>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">Waiting List</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('waiting-lists.create') }}" class="btn btn-success btn-sm mb-3">Add to Waiting List</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($waitingLists ?? [] as $waitList)
                                <tr>
                                    <td>#{{ $waitList->list_id }}</td>
                                    <td>{{ $waitList->status }}</td>
                                    <td>
                                        <a href="{{ route('waiting-lists.show', $waitList->list_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('waiting-lists.edit', $waitList->list_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('waiting-lists.destroy', $waitList->list_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-center">No waiting lists</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('waiting-lists.index') }}" class="btn btn-primary btn-sm mt-3">View All Waiting Lists</a>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">Reports</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('reports.create') }}" class="btn btn-success btn-sm mb-3">Add Report</a>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($reports ?? [] as $report)
                                <tr>
                                    <td>#{{ $report->report_id }}</td>
                                    <td>{{ $report->report_type ?? 'General' }}</td>
                                    <td>
                                        <a href="{{ route('reports.show', $report->report_id) }}" class="btn btn-info btn-xs">View</a>
                                        <a href="{{ route('reports.edit', $report->report_id) }}" class="btn btn-warning btn-xs">Edit</a>
                                        <form action="{{ route('reports.destroy', $report->report_id) }}" method="POST" style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-xs" onclick="return confirm('Delete?')">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-center">No reports</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <a href="{{ route('reports.index') }}" class="btn btn-primary btn-sm mt-3">View All Reports</a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .btn-xs {
        padding: 0.25rem 0.4rem;
        font-size: 0.875rem;
    }
</style>
@endsection
