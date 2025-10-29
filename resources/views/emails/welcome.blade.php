@extends('emails.layout')

@section('content')
<h1 class="email-title">Bem-vindo ao ZapClass, {{ $name }}!</h1>

<p class="email-text">
    Estamos muito felizes em tê-lo conosco! Sua conta foi criada com sucesso e você já pode começar a usar todos os recursos da plataforma.
</p>

<p class="email-text">
    Com o ZapClass, você pode:
</p>

<ul style="color: #374151; margin: 0 0 16px 0; padding-left: 24px;">
    <li style="margin-bottom: 8px;">Gerenciar suas conexões WhatsApp de forma fácil e intuitiva</li>
    <li style="margin-bottom: 8px;">Enviar mensagens automatizadas para seus contatos</li>
    <li style="margin-bottom: 8px;">Acompanhar métricas e relatórios em tempo real</li>
    <li style="margin-bottom: 8px;">Integrar com suas ferramentas favoritas via API</li>
</ul>

<div style="text-align: center;">
    <a href="{{ $dashboardUrl }}" class="email-button">
        Acessar Minha Conta
    </a>
</div>

<div class="divider"></div>

<p class="email-text" style="font-size: 14px; color: #6b7280;">
    <strong>Precisa de ajuda?</strong><br>
    Nossa equipe de suporte está sempre disponível para ajudá-lo. Entre em contato conosco através do suporte dentro da plataforma ou respondendo este e-mail.
</p>
@endsection
