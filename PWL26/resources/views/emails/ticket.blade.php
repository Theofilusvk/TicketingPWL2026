<h2>Terima kasih telah membeli tiket!</h2>

<p>Order ID: {{ $order->id }}</p>
<p>Total: Rp {{ $order->total_price }}</p>

<p>QR Code Tiket:</p>
<img src="data:image/png;base64,{{ $qr }}">
