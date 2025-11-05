@extends('emails.layout')

@section('content')
<h1 class="email-title">Redefinição de Senha</h1>

<p class="email-text">
    Olá, {{ $name }}!
</p>

<p class="email-text">
    Você está recebendo este e-mail porque recebemos uma solicitação de redefinição de senha para sua conta.
</p>

<div style="text-align: center;">
    <a href="{{ $resetUrl }}" class="email-button">
        Redefinir Senha
    </a>
</div>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    Este link de redefinição de senha expirará em <strong>{{ $expireMinutes }} minutos</strong>.
</p>

<div class="divider"></div>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    Se você não solicitou uma redefinição de senha, nenhuma ação adicional é necessária. Sua senha permanecerá a mesma.
</p>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    <strong>Por segurança:</strong><br>
    Se você tiver dificuldade ao clicar no botão acima, copie e cole o link abaixo em seu navegador:
</p>

<p style="font-size: 12px; color: #9ca3af; word-break: break-all; padding: 12px; background-color: #f9fafb; border-radius: 4px; margin: 16px 0;">
    {{ $resetUrl }}
</p>
@endsection
