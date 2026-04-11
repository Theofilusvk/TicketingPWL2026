<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>E-Ticket Vortex</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            background-color: #000;
            color: #CBFF00;
            padding: 20px;
            text-align: center;
            text-transform: uppercase;
        }
        .content {
            padding: 30px;
        }
        .ticket-box {
            border: 2px dashed #000;
            padding: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .event-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .event-detail {
            font-size: 14px;
            color: #555;
            margin-bottom: 20px;
        }
        .ticket-info {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .ticket-info-item {
            display: table-cell;
            width: 50%;
        }
        .label {
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
        }
        .value {
            font-size: 16px;
            font-weight: bold;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 50px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>VORTEX SYSTEMS</h1>
        <p>OFFICIAL E-TICKET</p>
    </div>

    <div class="content">
        <p>Hello <strong>{{ $user->username }}</strong>,</p>

        @if(isset($isMerchandise) && $isMerchandise)
            <p>This is your official electronic invoice for your VORTEX merchandise purchase.</p>
            
            <div class="ticket-box">
                <div class="event-title">MERCHANDISE RECEIPT</div>
                <div class="event-detail" style="margin-bottom: 5px;">
                    Order No: ORD-{{ $order->order_id }}<br>
                    Date: {{ Carbon\Carbon::parse($order->created_at)->format('d M Y, H:i') }}
                </div>
                
                <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #ccc;">
                            <th style="padding: 10px 0;">Item</th>
                            <th style="padding: 10px 0;">Qty</th>
                            <th style="padding: 10px 0;">Price</th>
                            <th style="padding: 10px 0;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($merchandiseOrders as $m)
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0;">{{ $m->title }}</td>
                            <td style="padding: 10px 0;">{{ $m->quantity }}</td>
                            <td style="padding: 10px 0;">${{ number_format($m->amount_money / max(1, $m->quantity), 2) }}</td>
                            <td style="padding: 10px 0;">${{ number_format($m->amount_money, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
                <div style="text-align: right; margin-top: 10px; padding-top: 10px; border-top: 2px solid #ccc;">
                    <strong>Total Paid: ${{ number_format($order->total_price, 2) }}</strong>
                </div>

                <div class="qr-section">
                    <div class="label" style="margin-bottom:10px;">TRACKING RESI</div>
                    <div style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">
                        {{ $merchandiseOrders->first() && $merchandiseOrders->first()->tracking_number ? $merchandiseOrders->first()->tracking_number : 'PENDING - TO BE ASSIGNED' }}
                    </div>
                </div>
            </div>
        @else
            <p>This is your official electronic ticket. Please present the QR Code at the venue for scanning.</p>

            @foreach($tickets as $index => $ticket)
                @php
                    $matchingItem = $orderItems->firstWhere('order_item_id', $ticket->order_item_id);
                    $tierName = $matchingItem ? $matchingItem->ticket_name : 'GENERAL ACCESS';
                    $price = $matchingItem ? $matchingItem->unit_price : 0;
                @endphp
                <div class="ticket-box @if(!$loop->last) page-break @endif">
                    <div class="event-title">{{ $order->event->title ?? 'VORTEX EVENT' }}</div>
                    <div class="event-detail">
                        Date: {{ $order->event->start_time ?? 'TBA' }}<br>
                        Location: {{ $order->event->location ?? 'TBA' }}
                    </div>

                    <div class="ticket-info">
                        <div class="ticket-info-item">
                            <div class="label">TICKET HOLDER</div>
                            <div class="value">{{ $ticket->holder_name ?? $user->username ?? 'GUEST' }}</div>
                        </div>
                        <div class="ticket-info-item">
                            <div class="label">TIER / SECTION</div>
                            <div class="value">{{ $tierName }}</div>
                        </div>
                    </div>

                    <div class="ticket-info">
                        <div class="ticket-info-item">
                            <div class="label">ORDER NO</div>
                            <div class="value">ORD-{{ $order->order_id }}</div>
                        </div>
                        <div class="ticket-info-item">
                            <div class="label">TICKET ID</div>
                            <div class="value">{{ $ticket->unique_code }}</div>
                        </div>
                    </div>
                    
                    <div class="ticket-info" style="margin-bottom: 5px;">
                        <div class="ticket-info-item">
                            <div class="label">PRICE</div>
                            <div class="value">${{ number_format($price, 2) }}</div>
                        </div>
                        <div class="ticket-info-item">
                            <div class="label">TOTAL FARE PAID (INC. TAX/FEE)</div>
                            <div class="value">${{ number_format($order->total_price, 2) }}</div>
                        </div>
                    </div>

                    <div class="qr-section">
                        <div class="label" style="margin-bottom:10px;">SCAN AT ENTRY</div>
                        @if($ticket->qr_code_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($ticket->qr_code_path))
                            @php
                                $svgContent = \Illuminate\Support\Facades\Storage::disk('public')->get($ticket->qr_code_path);
                                $base64 = base64_encode($svgContent);
                                $src = 'data:image/svg+xml;base64,' . $base64;
                            @endphp
                            <img src="{{ $src }}" width="150" height="150" alt="QR Code">
                        @else
                            <div style="width:150px; height:150px; border:1px solid #ccc; display:inline-block; line-height:150px; color:#888;">QR PENDING</div>
                        @endif
                    </div>
                </div>
            @endforeach
        @endif

        <div class="footer">
            Vortex Systems &copy; {{ date('Y') }}<br>
            @if(isset($isMerchandise) && $isMerchandise)
                Thank you for your purchase. We will notify you once your tracking number is active.
            @else
                Please do not share this ticket with anyone. It is linked to your biometric signature.
            @endif
        </div>
    </div>

</body>
</html>
