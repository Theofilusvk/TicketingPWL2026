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
        <p>This is your official electronic ticket. Please present the QR Code at the venue for scanning.</p>

        @foreach($tickets as $index => $ticket)
            @php
                // Find matching orderItem to get ticket tier name
                $matchingItem = $orderItems->firstWhere('order_item_id', $ticket->order_item_id);
                $tierName = $matchingItem ? $matchingItem->ticket_name : 'GENERAL ACCESS';
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

                <div class="qr-section">
                    <div class="label" style="margin-bottom:10px;">SCAN AT ENTRY</div>
                    @if($ticket->qr_code_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($ticket->qr_code_path))
                        @php
                            // Embed SVG directly into HTML for dompdf or base64 encode it
                            $svgContent = \Illuminate\Support\Facades\Storage::disk('public')->get($ticket->qr_code_path);
                            // dompdf supports basic SVG or we can encode it as data URI
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

        <div class="footer">
            Vortex Ticketing Systems &copy; {{ date('Y') }}<br>
            Please do not share this ticket with anyone. It is linked to your biometric signature.
        </div>
    </div>

</body>
</html>
