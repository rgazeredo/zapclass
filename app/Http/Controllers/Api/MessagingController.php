<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendTextMessageRequest;
use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MessagingController extends Controller
{
    protected UazApiService $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    /**
     * Enviar mensagem de texto
     *
     * @param SendTextMessageRequest $request
     * @return JsonResponse
     */
    public function sendText(SendTextMessageRequest $request): JsonResponse
    {
        try {
            // Pegar conexão autenticada do middleware
            $connection = $request->attributes->get('api_connection');

            // Validar se temos os dados necessários para chamar a API UAZ
            if (!$connection->token || !$connection->instance_id) {
                return $this->errorResponse(
                    'Conexão não configurada adequadamente. Entre em contato com o suporte.',
                    500
                );
            }

            // Preparar dados para a API UAZ
            $messageData = [
                'recipient' => $request->phone_number,
                'text' => $request->message,
            ];

            // Gerar ID único para rastreamento
            $messageId = 'msg_' . Str::random(20);

            Log::info('API: Enviando mensagem via UAZ', [
                'message_id' => $messageId,
                'connection_id' => $connection->id,
                'recipient' => $request->phone_number,
                'message_length' => strlen($request->message)
            ]);

            // Chamar API UAZ
            $response = $this->uazApiService->sendMessage($connection->token, $messageData);

            // Log da resposta
            Log::info('API: Resposta da UAZ', [
                'message_id' => $messageId,
                'connection_id' => $connection->id,
                'uaz_response' => $response
            ]);

            // Retornar resposta padronizada
            return $this->successResponse([
                'message_id' => $messageId,
                'status' => 'sent',
                'recipient' => $request->phone_number,
                'message' => $request->message,
                'timestamp' => now()->toISOString(),
                'connection_id' => $connection->client_instance_id,
            ], 'Mensagem enviada com sucesso');

        } catch (Exception $e) {
            Log::error('API: Erro ao enviar mensagem', [
                'connection_id' => $connection?->id,
                'recipient' => $request->phone_number,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    /**
     * Obter status de uma mensagem
     *
     * @param Request $request
     * @param string $messageId
     * @return JsonResponse
     */
    public function getMessageStatus(Request $request, string $messageId): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Por enquanto, retornamos um status genérico
            // Futuramente pode ser implementado tracking real via webhooks
            return $this->successResponse([
                'message_id' => $messageId,
                'status' => 'delivered', // sent, delivered, read, failed
                'timestamp' => now()->toISOString(),
                'connection_id' => $connection->client_instance_id,
            ]);

        } catch (Exception $e) {
            Log::error('API: Erro ao consultar status da mensagem', [
                'message_id' => $messageId,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erro ao consultar status da mensagem', 500);
        }
    }

    /**
     * Obter informações da conexão
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getConnectionInfo(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            return $this->successResponse([
                'connection_id' => $connection->client_instance_id,
                'name' => $connection->name,
                'status' => $connection->status,
                'phone' => $connection->phone,
                'api_usage_count' => $connection->api_usage_count,
                'api_rate_limit' => $connection->api_rate_limit,
                'api_last_used' => $connection->api_last_used_at?->toISOString(),
            ]);

        } catch (Exception $e) {
            Log::error('API: Erro ao obter informações da conexão', [
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erro ao obter informações da conexão', 500);
        }
    }

    /**
     * Resposta de sucesso padronizada
     */
    private function successResponse(array $data, string $message = 'Operação realizada com sucesso'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Resposta de erro padronizada
     */
    private function errorResponse(string $message, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => 'api_error',
            'message' => $message,
            'timestamp' => now()->toISOString()
        ], $status);
    }
}
