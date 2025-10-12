<?php

namespace App\Http\Controllers;

use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookProxyController extends Controller
{
    /**
     * Recebe webhook da UazAPI e repassa para o cliente
     */
    public function handle(Request $request, string $webhookCode)
    {
        Log::info('Webhook proxy received', [
            'webhook_code' => $webhookCode,
            'payload' => $request->all(),
        ]);

        try {
            // Buscar webhook pelo código
            $webhook = Webhook::where('webhook_code', $webhookCode)->first();

            if (!$webhook) {
                Log::warning('Webhook not found', ['webhook_code' => $webhookCode]);
                return response()->json([
                    'success' => false,
                    'message' => 'Webhook not found'
                ], 404);
            }

            // Verificar se o webhook está habilitado
            if (!$webhook->enabled) {
                Log::info('Webhook is disabled', ['webhook_code' => $webhookCode]);
                return response()->json([
                    'success' => true,
                    'message' => 'Webhook disabled'
                ], 200);
            }

            // Repassar o webhook para a URL do cliente
            $clientUrl = $webhook->url;
            $payload = $request->all();
            $headers = [
                'Content-Type' => 'application/json',
                'User-Agent' => 'ZapClass-Webhook/1.0',
                'X-Webhook-Source' => 'zapclass',
                'X-Webhook-Code' => $webhookCode,
            ];

            Log::info('Forwarding webhook to client', [
                'webhook_code' => $webhookCode,
                'client_url' => $clientUrl,
            ]);

            // Enviar para o cliente
            $response = Http::timeout(30)
                ->withHeaders($headers)
                ->post($clientUrl, $payload);

            Log::info('Webhook forwarded to client', [
                'webhook_code' => $webhookCode,
                'status_code' => $response->status(),
                'success' => $response->successful(),
            ]);

            // Retornar sucesso para a UazAPI
            return response()->json([
                'success' => true,
                'message' => 'Webhook received and forwarded',
                'client_status' => $response->status(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error processing webhook', [
                'webhook_code' => $webhookCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Retornar sucesso para a UazAPI mesmo com erro,
            // para evitar que ela fique reenviando
            return response()->json([
                'success' => true,
                'message' => 'Webhook received but failed to forward',
                'error' => $e->getMessage(),
            ], 200);
        }
    }
}
