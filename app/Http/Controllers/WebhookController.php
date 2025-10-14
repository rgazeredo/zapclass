<?php

namespace App\Http\Controllers;

use App\Models\Webhook;
use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    protected $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    /**
     * List webhooks for a WhatsApp connection
     */
    public function index(Request $request, int $connectionId): JsonResponse
    {
        $connection = WhatsAppConnection::where('id', $connectionId)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->firstOrFail();

        $webhooks = $connection->webhooks()->get();

        return response()->json([
            'success' => true,
            'webhooks' => $webhooks
        ]);
    }

    /**
     * Store a new webhook
     */
    public function store(Request $request, int $connectionId): JsonResponse
    {
        $connection = WhatsAppConnection::where('id', $connectionId)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'events' => 'nullable|array',
            'exclude_events' => 'nullable|array',
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Validar filtros mutuamente exclusivos
        $excludeEvents = $request->exclude_events ?? [];
        $conflictingPairs = [
            ['wasSentByApi', 'wasNotSentByApi'],
            ['fromMeYes', 'fromMeNo'],
            ['isGroupYes', 'isGroupNo']
        ];

        foreach ($conflictingPairs as $pair) {
            if (in_array($pair[0], $excludeEvents) && in_array($pair[1], $excludeEvents)) {
                return response()->json([
                    'success' => false,
                    'message' => "Os filtros '{$pair[0]}' e '{$pair[1]}' são mutuamente exclusivos. Ative apenas um deles.",
                    'conflicting_filters' => $pair
                ], 422);
            }
        }

        // Verificar se já existe um webhook com esta URL para esta conexão
        $existingWebhook = $connection->webhooks()
            ->where('url', $request->url)
            ->first();

        if ($existingWebhook) {
            return response()->json([
                'success' => false,
                'message' => 'Já existe um webhook cadastrado com esta URL',
                'existing_webhook' => $existingWebhook,
                'suggestion' => 'Edite o webhook existente ao invés de criar um novo'
            ], 409); // 409 Conflict
        }

        try {
            // Criar webhook localmente primeiro
            $webhookData = $validator->validated();
            $webhookData['whatsapp_connection_id'] = $connection->id;

            // Gerar código único para o webhook
            $webhookData['webhook_code'] = \Illuminate\Support\Str::random(32);

            $webhook = Webhook::create($webhookData);

            // Tentar sincronizar com a API (sempre, pois a API controla o enabled)
            $syncResult = $this->syncWebhookWithApi($webhook, $connection);

            $webhook->update([
                'synced' => $syncResult['success'],
                'external_webhook_id' => $syncResult['external_webhook_id'] ?? null
            ]);

            return response()->json([
                'success' => true,
                'webhook' => $webhook->fresh(),
                'sync_result' => $syncResult
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating webhook', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update webhook
     */
    public function update(Request $request, int $connectionId, int $webhookId): JsonResponse
    {
        $connection = WhatsAppConnection::where('id', $connectionId)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->firstOrFail();

        $webhook = $connection->webhooks()->findOrFail($webhookId);

        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'events' => 'nullable|array',
            'exclude_events' => 'nullable|array',
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Validar filtros mutuamente exclusivos
        $excludeEvents = $request->exclude_events ?? [];
        $conflictingPairs = [
            ['wasSentByApi', 'wasNotSentByApi'],
            ['fromMeYes', 'fromMeNo'],
            ['isGroupYes', 'isGroupNo']
        ];

        foreach ($conflictingPairs as $pair) {
            if (in_array($pair[0], $excludeEvents) && in_array($pair[1], $excludeEvents)) {
                return response()->json([
                    'success' => false,
                    'message' => "Os filtros '{$pair[0]}' e '{$pair[1]}' são mutuamente exclusivos. Ative apenas um deles.",
                    'conflicting_filters' => $pair
                ], 422);
            }
        }

        // Verificar se já existe outro webhook com esta URL (exceto o atual)
        $existingWebhook = $connection->webhooks()
            ->where('url', $request->url)
            ->where('id', '!=', $webhookId)
            ->first();

        if ($existingWebhook) {
            return response()->json([
                'success' => false,
                'message' => 'Já existe outro webhook cadastrado com esta URL',
                'existing_webhook' => $existingWebhook,
                'suggestion' => 'Use uma URL diferente ou edite o webhook existente'
            ], 409); // 409 Conflict
        }

        try {
            $webhook->update($validator->validated());

            // Tentar atualizar na API (sempre, pois a API controla o enabled)
            $syncResult = $this->updateWebhookWithApi($webhook, $connection);

            $webhook->update([
                'synced' => $syncResult['success'],
                'external_webhook_id' => $syncResult['webhook_id'] ?? $webhook->external_webhook_id
            ]);

            return response()->json([
                'success' => true,
                'webhook' => $webhook->fresh(),
                'sync_result' => $syncResult
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating webhook', [
                'webhook_id' => $webhookId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete webhook
     */
    public function destroy(int $connectionId, int $webhookId): JsonResponse
    {
        $connection = WhatsAppConnection::where('id', $connectionId)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->firstOrFail();

        $webhook = $connection->webhooks()->findOrFail($webhookId);

        try {
            // Tentar remover da API primeiro se estiver sincronizado e tiver token
            if ($webhook->synced && $connection->token && $connection->instance_id) {
                try {
                    $this->removeWebhookFromApi($webhook, $connection);
                    Log::info('Webhook removido da API UAZ', [
                        'webhook_id' => $webhook->id,
                        'connection_id' => $connection->id
                    ]);
                } catch (\Exception $apiError) {
                    // Apenas log o erro, não impede a exclusão local
                    Log::warning('Falha ao remover webhook da API UAZ (continuando com exclusão local)', [
                        'webhook_id' => $webhook->id,
                        'error' => $apiError->getMessage()
                    ]);
                }
            }

            $webhook->delete();

            return response()->json([
                'success' => true,
                'message' => 'Webhook removido com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting webhook', [
                'webhook_id' => $webhookId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync webhook with API
     */
    protected function syncWebhookWithApi(Webhook $webhook, WhatsAppConnection $connection): array
    {
        try {
            // Usar URL do nosso servidor ao invés da URL do cliente
            $proxyUrl = config('app.url') . '/webhooks/whatsapp/' . $webhook->webhook_code;

            $webhookData = [
                'id' => $webhook->webhook_code,
                'url' => $proxyUrl,
                'enabled' => $webhook->enabled,
            ];

            if ($webhook->events && count($webhook->events) > 0) {
                $webhookData['events'] = $webhook->events;
            }

            if ($webhook->exclude_events && count($webhook->exclude_events) > 0) {
                $webhookData['excludeMessages'] = $webhook->exclude_events;
            }

            $response = $this->uazApiService->createWebhook(
                $connection->token,
                $connection->instance_id,
                $webhookData
            );

            // A API retorna a lista completa de webhooks
            // Precisamos encontrar o webhook que acabamos de criar pela URL
            $externalWebhookId = null;

            Log::info('Resposta da API ao criar webhook', [
                'webhook_id' => $webhook->id,
                'response' => $response
            ]);

            // A resposta pode ter diferentes estruturas, vamos tentar diferentes caminhos
            $webhooksList = $response['webhooks'] ?? $response['data'] ?? $response;

            if (is_array($webhooksList)) {
                foreach ($webhooksList as $apiWebhook) {
                    // Comparar pela URL do proxy
                    if (isset($apiWebhook['url']) && $apiWebhook['url'] === $proxyUrl) {
                        $externalWebhookId = $apiWebhook['id'] ?? $apiWebhook['_id'] ?? null;

                        Log::info('Webhook encontrado na lista da API', [
                            'webhook_id' => $webhook->id,
                            'external_webhook_id' => $externalWebhookId,
                            'proxy_url' => $proxyUrl
                        ]);

                        break;
                    }
                }
            }

            if (!$externalWebhookId) {
                Log::warning('Não foi possível encontrar o external_webhook_id na resposta da API', [
                    'webhook_id' => $webhook->id,
                    'proxy_url' => $proxyUrl,
                    'response_structure' => array_keys(is_array($response) ? $response : [])
                ]);
            }

            return [
                'success' => true,
                'external_webhook_id' => $externalWebhookId,
                'message' => 'Webhook sincronizado com sucesso'
            ];
        } catch (\Exception $e) {
            Log::error('Error syncing webhook with API', [
                'webhook_id' => $webhook->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Falha na sincronização: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update webhook with API
     */
    protected function updateWebhookWithApi(Webhook $webhook, WhatsAppConnection $connection): array
    {
        try {
            // Verificar se temos o external_webhook_id
            if (!$webhook->external_webhook_id) {
                Log::warning('Webhook não possui external_webhook_id, não é possível atualizar na API', [
                    'webhook_id' => $webhook->id
                ]);

                return [
                    'success' => false,
                    'message' => 'Webhook não possui ID externo para atualização'
                ];
            }

            // Usar URL do nosso servidor ao invés da URL do cliente
            $proxyUrl = config('app.url') . '/webhooks/whatsapp/' . $webhook->webhook_code;

            $webhookData = [
                'id' => $webhook->external_webhook_id,
                'url' => $proxyUrl,
                'enabled' => $webhook->enabled,
            ];

            if ($webhook->events && count($webhook->events) > 0) {
                $webhookData['events'] = $webhook->events;
            }

            if ($webhook->exclude_events && count($webhook->exclude_events) > 0) {
                $webhookData['excludeMessages'] = $webhook->exclude_events;
            }

            $response = $this->uazApiService->updateWebhook(
                $connection->token,
                $connection->instance_id,
                $webhookData
            );

            return [
                'success' => true,
                'webhook_id' => $response['webhook_id'] ?? null,
                'message' => 'Webhook atualizado com sucesso'
            ];
        } catch (\Exception $e) {
            Log::error('Error updating webhook with API', [
                'webhook_id' => $webhook->id,
                'external_webhook_id' => $webhook->external_webhook_id ?? null,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Falha na atualização: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Remove webhook from API
     */
    protected function removeWebhookFromApi(Webhook $webhook, WhatsAppConnection $connection): void
    {
        // Verificar se temos o external_webhook_id
        if (!$webhook->external_webhook_id) {
            Log::warning('Webhook não possui external_webhook_id, não é possível remover da API', [
                'webhook_id' => $webhook->id
            ]);

            throw new \Exception('Webhook não possui ID externo para remoção');
        }

        Log::info('Tentando remover webhook da API UAZ', [
            'webhook_id' => $webhook->id,
            'external_webhook_id' => $webhook->external_webhook_id,
            'connection_id' => $connection->id,
            'instance_id' => $connection->instance_id,
            'has_token' => !empty($connection->token)
        ]);

        $this->uazApiService->deleteWebhook(
            $connection->token,
            $connection->instance_id,
            $webhook->external_webhook_id
        );

        Log::info('Webhook removido da API UAZ com sucesso', [
            'webhook_id' => $webhook->id,
            'external_webhook_id' => $webhook->external_webhook_id
        ]);
    }
}
