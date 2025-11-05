<?php

namespace App\Listeners;

use App\Jobs\DisconnectExpiredSubscriptionInstances;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Events\WebhookReceived;

class HandleSubscriptionUpdated
{
    /**
     * Handle the event.
     */
    public function handle(WebhookReceived $event): void
    {
        // Verificar se é o evento de subscription updated
        if ($event->payload['type'] !== 'customer.subscription.updated') {
            return;
        }

        $subscriptionData = $event->payload['data']['object'] ?? null;
        $subscriptionId = $subscriptionData['id'] ?? null;
        $status = $subscriptionData['status'] ?? null;

        if (!$subscriptionId || !$status) {
            Log::warning('Webhook subscription.updated com dados incompletos', [
                'payload' => $event->payload
            ]);
            return;
        }

        Log::info('Processando webhook subscription.updated', [
            'subscription_id' => $subscriptionId,
            'status' => $status
        ]);

        // Buscar subscription no banco
        $subscription = Subscription::where('stripe_id', $subscriptionId)->first();

        if (!$subscription) {
            Log::warning('Subscription não encontrada no banco', [
                'stripe_subscription_id' => $subscriptionId
            ]);
            return;
        }

        // Se o status mudou para inativo, disparar job de desconexão
        $inactiveStatuses = ['canceled', 'unpaid', 'past_due', 'incomplete_expired'];

        if (in_array($status, $inactiveStatuses)) {
            Log::info('Subscription entrou em status inativo, disparando job de desconexão', [
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscriptionId,
                'status' => $status
            ]);

            DisconnectExpiredSubscriptionInstances::dispatch($subscription->tenant_id);
        }
    }
}
