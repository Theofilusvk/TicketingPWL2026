@extends('layouts.app')

@section('content')
    <div class="container">

        <!-- 🔥 DASHBOARD STATS -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-success text-white p-3">
                    <h5>Total Revenue</h5>
                    <h3>Rp {{ number_format($totalRevenue, 0, ',', '.') }}</h3>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-primary text-white p-3">
                    <h5>Total Orders</h5>
                    <h3>{{ $totalOrders }}</h3>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white p-3">
                    <h5>Total Users</h5>
                    <h3>{{ $totalUsers }}</h3>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-dark text-white p-3">
                    <h5>Total Events</h5>
                    <h3>{{ $totalEvents }}</h3>
                </div>
            </div>
        </div>

        <!-- 🔥 TITLE -->
        <div class="row mb-4">
            <div class="col-md-8">
                <h1>Reports</h1>
            </div>
            <div class="col-md-4 text-right">
                <a href="{{ route('reports.create') }}" class="btn btn-primary">New Report</a>
            </div>
        </div>

        <!-- 🔥 ALERT -->
        @if($message = Session::get('success'))
            <div class="alert alert-success alert-dismissible fade show">
                {{ $message }}
                <button type="button" class="close" data-dismiss="alert">×</button>
            </div>
        @endif

        <!-- 🔥 REPORT TABLE (ASLI KAMU) -->
        <div class="card mb-5">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light">
                    <tr>
                        <th>ID</th>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th style="width: 130px;">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($reports as $report)
                        <tr>
                            <td>#{{ $report->report_id }}</td>
                            <td>{{ $report->event->title ?? 'N/A' }}</td>
                            <td>{{ $report->report_type ?? 'General' }}</td>
                            <td>{{ $report->created_at->format('M d, Y') }}</td>
                            <td>
                                <a href="{{ route('reports.show', $report->report_id) }}" class="btn btn-info btn-sm">View</a>
                                <a href="{{ route('reports.edit', $report->report_id) }}" class="btn btn-warning btn-sm">Edit</a>
                                <form action="{{ route('reports.destroy', $report->report_id) }}" method="POST" style="display:inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Sure?')">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center py-4">No reports found</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 🔥 ORDER TABLE (BARU) -->
        <h2>Order Transactions</h2>

        <div class="card">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="bg-light">
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($orders as $order)
                        <tr>
                            <td>#{{ $order->id }}</td>
                            <td>{{ $order->user->name ?? '-' }}</td>
                            <td>Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
                            <td>
                            <span class="badge
                                @if($order->status == 'paid') badge-success
                                @elseif($order->status == 'pending') badge-warning
                                @else badge-danger
                                @endif">
                                {{ strtoupper($order->status) }}
                            </span>
                            </td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>

    </div>
@endsection
