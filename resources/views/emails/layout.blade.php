<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $subject ?? 'ZapClass' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f9fafb;
            padding: 40px 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background-color: #111827;
            padding: 32px;
            text-align: center;
        }
        .email-logo {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        .email-body {
            padding: 40px 32px;
        }
        .email-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 16px 0;
        }
        .email-text {
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            margin: 0 0 16px 0;
        }
        .email-button {
            display: inline-block;
            padding: 12px 24px;
            margin: 24px 0;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            background-color: #111827;
            text-decoration: none;
            border-radius: 6px;
            transition: background-color 0.2s;
        }
        .email-button:hover {
            background-color: #1f2937;
        }
        .email-footer {
            padding: 32px;
            text-align: center;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }
        .email-footer-text {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 8px 0;
        }
        .email-footer-link {
            color: #111827;
            text-decoration: none;
        }
        .email-footer-link:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                border-radius: 0;
            }
            .email-header,
            .email-body,
            .email-footer {
                padding: 24px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <a href="{{ config('app.url') }}" class="email-logo">
                    ZapClass
                </a>
            </div>

            <!-- Body -->
            <div class="email-body">
                @yield('content')
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <p class="email-footer-text">
                    &copy; {{ date('Y') }} ZapClass. Todos os direitos reservados.
                </p>
                <p class="email-footer-text">
                    <a href="{{ config('app.url') }}/termos-de-uso" class="email-footer-link">Termos de Uso</a>
                    &nbsp;&middot;&nbsp;
                    <a href="{{ config('app.url') }}/politica-de-privacidade" class="email-footer-link">Política de Privacidade</a>
                </p>
                <p class="email-footer-text">
                    Se você não solicitou este e-mail, pode ignorá-lo com segurança.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
