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
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Criar webhook localmente primeiro
            $webhookData = $validator->validated();
            $webhookData['whatsapp_connection_id'] = $connection->id;
            $webhook = Webhook::create($webhookData);

            // Tentar sincronizar com a API
            $syncResult = $this->syncWebhookWithApi($webhook, $connection);

            $webhook->update([
                'synced' => $syncResult['success'],
                'external_webhook_id' => $syncResult['webhook_id'] ?? null
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
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $webhook->update($validator->validated());

            // Tentar ressincronizar com a API usando update
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
            // Tentar remover da API primeiro se estiver sincronizado
            if ($webhook->synced && $webhook->url) {
                $this->removeWebhookFromApi($webhook, $connection);
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
            $webhookData = [
                'url' => $webhook->url,
            ];

            if ($webhook->events && count($webhook->events) > 0) {
                $webhookData['events'] = $webhook->events;
            }

            // TODO: Reativar quando API corrigir o excludeMessages
            // if ($webhook->exclude_events && count($webhook->exclude_events) > 0) {
            //     $webhookData['excludeMessages'] = $webhook->exclude_events;
            // }

            $response = $this->uazApiService->createWebhook(
                $connection->token,
                $connection->instance_id,
                $webhookData
            );

            return [
                'success' => true,
                'webhook_id' => $response['webhook_id'] ?? null,
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
            $webhookData = [
                'url' => $webhook->url,
            ];

            if ($webhook->events && count($webhook->events) > 0) {
                $webhookData['events'] = $webhook->events;
            }

            // TODO: Reativar quando API corrigir o excludeMessages
            // if ($webhook->exclude_events && count($webhook->exclude_events) > 0) {
            //     $webhookData['excludeMessages'] = $webhook->exclude_events;
            // }

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
        try {
            $this->uazApiService->deleteWebhook(
                $connection->token,
                $connection->instance_id,
                $webhook->url
            );
        } catch (\Exception $e) {
            Log::warning('Failed to remove webhook from API', [
                'webhook_id' => $webhook->id,
                'webhook_url' => $webhook->url,
                'error' => $e->getMessage()
            ]);
        }
    }
}
