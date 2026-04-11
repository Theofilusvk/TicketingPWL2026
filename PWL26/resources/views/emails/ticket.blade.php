<x-mail::message>
@if(isset($isMerchandise) && $isMerchandise)
# VORTEX SYSTEMS - MERCHANDISE INVOICE

Hello **{{ $user->username }}**,

Transaksi Merchandise Anda telah berhasil dibayar. Kami telah menerima pesanan untuk item berikut:

### Rincian Pesanan:
@foreach($merchandiseOrders as $item)
- **Item:** {{ $item->title }}
- **Kuantitas:** {{ $item->quantity }}
@endforeach

Barang Anda akan segera dikirim. Nomor Resi (Tracking Number) Anda adalah: 
**{{ $merchandiseOrders->first() && $merchandiseOrders->first()->tracking_number ? $merchandiseOrders->first()->tracking_number : 'PENDING (Menunggu Pengiriman)' }}**

Harap simpan email ini dan **unduh lampiran bukti Receipt/Invoice di bagian bawah email ini**.

Terima kasih atas pembelian Anda, <br>
*Vortex Merchandise Store*

@else
# VORTEX SYSTEMS - E-TICKET ISSUED

Hello **{{ $user->username }}**,

Transaksi Anda telah berhasil. Kami telah mengamankan tiket Anda untuk event berikut:
**Event Title:** {{ $order->event->title ?? 'VORTEX_EVENT_001' }}

### Rincian Tiket:
@foreach($orderItems as $item)
- **Tipe:** {{ $item->ticket_name }}
- **Kuantitas:** {{ $item->quantity }}
@endforeach

### Kode Tiket (QR Ready):
@foreach($tickets as $ticket)
* **{{ $ticket->unique_code }}**
@if($ticket->qr_code_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($ticket->qr_code_path))
    @php
        $svgContent = \Illuminate\Support\Facades\Storage::disk('public')->get($ticket->qr_code_path);
        $base64 = base64_encode($svgContent);
        $src = 'data:image/svg+xml;base64,' . $base64;
    @endphp
    <!-- Using inline base64 since SVG embed varies by email client -->
    <img src="{{ $src }}" width="150" height="150" alt="QR Code {{ $ticket->unique_code }}" style="margin-top:10px; margin-bottom:10px;" />
@else
    <p><em>QR Code terlampir / dapat diunduh di dashboard</em></p>
@endif
<br>
@endforeach

Harap simpan email ini dan **unduh lampiran PDF (E-Ticket) di bagian bawah email ini**. Tunjukkan QR Code pada saat check-in di gate.

Terima kasih, <br>
*Vortex Ticketing System*
@endif
</x-mail::message>
