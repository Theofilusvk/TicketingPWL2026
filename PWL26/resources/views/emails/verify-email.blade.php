@component('mail::message')
# Verifikasi Email Anda

Halo {{ $user->username }},

Terima kasih telah mendaftar di **Vortex Ticketing System**. Untuk menyelesaikan proses registrasi dan mengaktifkan akun Anda, silakan klik tombol di bawah untuk memverifikasi email Anda.

@component('mail::button', ['url' => $verificationUrl])
Verifikasi Email Saya
@endcomponent

Atau salin dan buka URL ini di browser Anda:
{{ $verificationUrl }}

**Catatan**: Link verifikasi ini hanya berlaku selama 24 jam.

Jika Anda tidak melakukan pendaftaran akun ini, abaikan email ini.

Salam hangat,
**Vortex Ticketing System**
@endcomponent
