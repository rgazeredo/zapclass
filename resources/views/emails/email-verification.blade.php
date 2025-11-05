@extends('emails.layout')

@section('content')
<h1 class="email-title">Confirme seu Endereço de E-mail</h1>

<p class="email-text">
    Olá, {{ $name }}!
</p>

<p class="email-text">
    Obrigado por se cadastrar no ZapClass! Para completar seu cadastro e começar a usar a plataforma, precisamos que você verifique seu endereço de e-mail.
</p>

<div style="text-align: center;">
    <a href="{{ $verificationUrl }}" class="email-button">
        Verificar E-mail
    </a>
</div>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    Este link de verificação expirará em <strong>{{ $expireMinutes }} minutos</strong>.
</p>

<div class="divider"></div>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    <strong>Por segurança:</strong><br>
    Se você tiver dificuldade ao clicar no botão acima, copie e cole o link abaixo em seu navegador:
</p>

<p style="font-size: 12px; color: #9ca3af; word-break: break-all; padding: 12px; background-color: #f9fafb; border-radius: 4px; margin: 16px 0;">
    {{ $verificationUrl }}
</p>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    Se você não criou uma conta no ZapClass, pode ignorar este e-mail com segurança.
</p>
@endsection
