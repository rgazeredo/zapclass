<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionActive
{
    /**
     * Handle an incoming request.
     *
     * Verifica se o tenant do usuário possui assinatura ativa.
     * Permite acesso para usuários em período de trial.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $tenant = $user->tenant;

        if (!$tenant) {
            return redirect()->route('home')
                ->with('error', 'Conta não encontrada.');
        }

        // Permitir acesso se estiver em trial
        if ($tenant->isOnTrial()) {
            return $next($request);
        }

        // Verificar se tem assinatura ativa
        if (!$tenant->hasActiveSubscription()) {
            return redirect()->route('billing.index')
                ->with('error', 'Sua assinatura está inativa. Por favor, renove sua assinatura para continuar usando o sistema.');
        }

        return $next($request);
    }
}
