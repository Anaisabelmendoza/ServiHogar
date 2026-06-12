@component('mail::message')
{{-- Logo / Cabecera --}}
<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #04608c; font-size: 28px; font-weight: bold; margin: 0;">🏠 ServiHogar</h1>
    <p style="color: #666; font-size: 14px; margin: 5px 0 0;">Plataforma de Servicios del Hogar</p>
</div>

---

# Recuperación de Contraseña

Hola **{{ $userName ?: 'usuario' }}**,

Hemos recibido una solicitud para **restablecer la contraseña** de tu cuenta en ServiHogar.

Usa el siguiente código de verificación en la app. Este código **caduca en 15 minutos**:

@component('mail::panel')
<div style="text-align: center;">
    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">Tu código de verificación es:</p>
    <span style="font-size: 48px; font-weight: bold; color: #04608c; letter-spacing: 12px; display: block;">{{ $code }}</span>
</div>
@endcomponent

> ⚠️ **Si no has solicitado este código**, puedes ignorar este email. Tu contraseña no cambiará.

---

@component('mail::subcopy')
Este email fue enviado automáticamente por ServiHogar. Por favor, no respondas a este mensaje.
@endcomponent

@endcomponent
