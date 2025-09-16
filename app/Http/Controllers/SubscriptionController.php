<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Subscription;

class SubscriptionController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('cashier.secret'));
    }

    /**
     * Handle successful subscription
     */
    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            return redirect()->route('home')->with('error', 'Sessão de pagamento não encontrada');
        }

        try {
            // Recuperar sessão do Stripe
            $session = Session::retrieve($sessionId, [
                'expand' => ['subscription', 'customer']
            ]);

            \Log::info('Session retrieved', ['session_id' => $sessionId, 'payment_status' => $session->payment_status ?? 'null']);

            if (!$session || $session->payment_status !== 'paid') {
                return redirect()->route('home')->with('error', 'Pagamento não confirmado');
            }

            // Verificar se a subscription foi expandida e buscar separadamente se necessário
            $subscription = null;
            if (is_string($session->subscription)) {
                \Log::info('Retrieving subscription separately', ['subscription_id' => $session->subscription]);
                $subscription = Subscription::retrieve($session->subscription);
            } else {
                $subscription = $session->subscription;
            }

            // Buscar tenant pelos metadados
            $tenantId = $session->metadata['tenant_id'] ?? null;
            $userId = $session->metadata['user_id'] ?? null;

            if (!$tenantId || !$userId) {
                return redirect()->route('home')->with('error', 'Dados da assinatura não encontrados');
            }

            $tenant = Tenant::find($tenantId);
            $user = User::find($userId);

            if (!$tenant || !$user) {
                return redirect()->route('home')->with('error', 'Conta não encontrada');
            }

            // Ativar tenant
            $tenant->update([
                'is_active' => true,
                'settings' => array_merge($tenant->settings ?? [], [
                    'subscription' => [
                        'stripe_subscription_id' => $subscription->id,
                        'status' => $subscription->status,
                        'activated_at' => now()->toISOString(),
                    ]
                ])
            ]);

            // Fazer login automático do usuário
            Auth::login($user);

            // Preparar dados do tenant com features
            $tenantData = $tenant->only(['name', 'plan_metadata']);
            $tenantData['plan_metadata']['features'] = $tenant->settings['features'] ?? [
                'Conexão WhatsApp',
                'Dashboard completo',
                'Mensagens ilimitadas',
                'Suporte técnico'
            ];

            return Inertia::render('Subscription/Success', [
                'tenant' => $tenantData,
                'subscription' => [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro ao processar sucesso da assinatura: ' . $e->getMessage());

            return redirect()->route('home')->with('error', 'Erro ao confirmar assinatura');
        }
    }

    /**
     * Handle cancelled subscription
     */
    public function cancel(Request $request, $tenantId = null)
    {
        $tenant = null;

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
        }

        return Inertia::render('Subscription/Cancel', [
            'tenant' => $tenant ? $tenant->only(['name', 'plan_metadata']) : null,
            'message' => 'Pagamento foi cancelado. Você pode tentar novamente ou escolher outro plano.'
        ]);
    }

    /**
     * Retry subscription for a cancelled tenant
     */
    public function retry(Request $request, $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);

        if ($tenant->is_active) {
            return redirect()->route('dashboard')->with('message', 'Sua conta já está ativa');
        }

        $planMetadata = $tenant->plan_metadata;

        if (!$planMetadata || !isset($planMetadata['stripe_price_id'])) {
            return redirect()->route('home')->with('error', 'Dados do plano não encontrados');
        }

        try {
            // Criar nova sessão de checkout
            $session = Session::create([
                'customer' => $tenant->stripe_id,
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price' => $planMetadata['stripe_price_id'],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'subscription',
                'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('subscription.cancel', ['tenant' => $tenant->id]),
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'user_id' => $tenant->users()->first()->id,
                ],
                'allow_promotion_codes' => true,
                'billing_address_collection' => 'auto',
            ]);

            return redirect($session->url);

        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao processar pagamento: ' . $e->getMessage());
        }
    }
}