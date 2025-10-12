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

            // Adicionar URL base da aplicação no payload
            $payload['BaseUrl'] = config('app.url');

            // Headers padrão limpos e seguros (sem expor infraestrutura interna)
            $defaultHeaders = [
                'Content-Type' => 'application/json',
                'User-Agent' => 'ZapClass-Webhook/1.0',
                'Accept' => 'application/json',
                'X-Webhook-Source' => 'zapclass',
                'X-Webhook-Code' => $webhookCode,
                'X-Webhook-Event' => $payload['event'] ?? 'unknown',
            ];

            // Mesclar com headers customizados do webhook (se existirem)
            // Headers customizados têm prioridade sobre os padrão
            $customHeaders = $webhook->custom_headers ?? [];
            $headers = array_merge($defaultHeaders, $customHeaders);

            Log::info('Forwarding webhook to client', [
                'webhook_code' => $webhookCode,
                'client_url' => $clientUrl,
                'default_headers' => $defaultHeaders,
                'custom_headers' => $customHeaders,
                'final_headers' => $headers,
            ]);

            // Enviar para o cliente com headers limpos
            // withOptions(['allow_redirects' => false]) evita seguir redirects
            // que poderiam adicionar headers extras
            $response = Http::withOptions([
                'allow_redirects' => false,
                'http_errors' => false,
            ])
                ->timeout(30)
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
