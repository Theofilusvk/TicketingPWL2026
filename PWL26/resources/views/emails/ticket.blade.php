<x-mail::message>
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
@foreach($ticketCodes as $code)
* **{{ $code }}**
<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ $code }}" alt="QR Code {{ $code }}" style="margin-top:10px; margin-bottom:10px;" />
<br>
@endforeach

Harap simpan email ini dan tunjukkan QR Code pada saat check-in.

Terima kasih, <br>
*Vortex Ticketing System*
</x-mail::message>
