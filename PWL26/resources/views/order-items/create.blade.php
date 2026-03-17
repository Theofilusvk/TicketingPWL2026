@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <h1>Create Order Item</h1>
            <hr>

            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="card">
                <div class="card-body">
                    <form action="{{ route('order-items.store') }}" method="POST">
                        @csrf

                        <div class="form-group">
                            <label for="order_id">Order</label>
                            <select class="form-control @error('order_id') is-invalid @enderror" id="order_id" name="order_id" required>
                                <option value="">Select Order</option>
                                @foreach($orders as $order)
                                    <option value="{{ $order->order_id }}" {{ old('order_id') == $order->order_id ? 'selected' : '' }}>#{{ $order->order_id }}</option>
                                @endforeach
                            </select>
                            @error('order_id')<span class="invalid-feedback">{{ $message }}</span>@enderror
                        </div>

                        <div class="form-group">
                            <label for="category_id">Category</label>
                            <select class="form-control @error('category_id') is-invalid @enderror" id="category_id" name="category_id" required>
                                <option value="">Select Category</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->category_id }}" {{ old('category_id') == $category->category_id ? 'selected' : '' }}>{{ $category->name }}</option>
                                @endforeach
                            </select>
                            @error('category_id')<span class="invalid-feedback">{{ $message }}</span>@enderror
                        </div>

                        <div class="form-group">
                            <label for="ticket_type">Ticket Type</label>
                            <select class="form-control @error('ticket_type') is-invalid @enderror" id="ticket_type" name="ticket_type" required>
                                <option value="">Select Type</option>
                                <option value="regular" {{ old('ticket_type') == 'regular' ? 'selected' : '' }}>Regular</option>
                                <option value="vip" {{ old('ticket_type') == 'vip' ? 'selected' : '' }}>VIP</option>
                                <option value="premium" {{ old('ticket_type') == 'premium' ? 'selected' : '' }}>Premium</option>
                            </select>
                            @error('ticket_type')<span class="invalid-feedback">{{ $message }}</span>@enderror
                        </div>

                        <div class="form-group">
                            <label for="quantity">Quantity</label>
                            <input type="number" class="form-control @error('quantity') is-invalid @enderror" id="quantity" name="quantity" value="{{ old('quantity') }}" required>
                            @error('quantity')<span class="invalid-feedback">{{ $message }}</span>@enderror
                        </div>

                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Create</button>
                            <a href="{{ route('order-items.index') }}" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
