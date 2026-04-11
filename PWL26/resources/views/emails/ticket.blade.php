<x-mail::message>
# Ticket for {{ $order->event->title ?? 'Vortex Event' }}

Hi {{ $order->user->name ?? 'Guest' }},

Thank you for your purchase! Your payment of Rp{{ number_format($order->price, 0, ',', '.') }} has been successfully confirmed.

Below are your ticket details:

<x-mail::panel>
**Order ID:** {{ $order->order_id }}  
**Event:** {{ $order->event->title ?? 'Vortex Event' }}  
**Total Items:** {{ $order->items ? $order->items->sum('quantity') : 1 }}  
</x-mail::panel>

### Your E-Tickets

@php
    // Fetch tickets associated with this order
    $tickets = \App\Models\Ticket::where('order_id', $order->order_id)->get();
@endphp

@foreach($tickets as $ticket)
<div style="text-align: center; margin-bottom: 20px; padding: 10px; border: 1px dashed #ccc;">
    <p><strong>Ticket Code:</strong> {{ $ticket->ticket_code }}</p>
    <!-- Using external API to generate QR Code since local library requires ext-gd which might not be available -->
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($ticket->ticket_code) }}" alt="QR Code {{ $ticket->ticket_code }}">
</div>
@endforeach

<x-mail::button :url="env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard/tickets'">
View My Tickets
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
