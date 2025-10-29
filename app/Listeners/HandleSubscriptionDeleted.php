<?php

namespace App\Listeners;

use App\Jobs\DisconnectExpiredSubscriptionInstances;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Events\WebhookReceived;

class HandleSubscriptionDeleted
{
    /**
     * Handle the event.
     */
    public function handle(WebhookReceived $event): void
    {
        // Verificar se é o evento de subscription deleted
        if ($event->payload['type'] !== 'customer.subscription.deleted') {
            return;
        }

        $subscriptionId = $event->payload['data']['object']['id'] ?? null;

        if (!$subscriptionId) {
            Log::warning('Webhook subscription.deleted sem ID de assinatura', [
                'payload' => $event->payload
            ]);
            return;
        }

        Log::info('Processando webhook subscription.deleted', [
            'subscription_id' => $subscriptionId
        ]);

        // Buscar subscription no banco
        $subscription = Subscription::where('stripe_id', $subscriptionId)->first();

        if (!$subscription) {
            Log::warning('Subscription não encontrada no banco', [
                'stripe_subscription_id' => $subscriptionId
            ]);
            return;
        }

        // Disparar job para desconectar instâncias
        DisconnectExpiredSubscriptionInstances::dispatch($subscription->tenant_id);

        Log::info('Job de desconexão disparado', [
            'tenant_id' => $subscription->tenant_id,
            'subscription_id' => $subscriptionId
        ]);
    }
}
