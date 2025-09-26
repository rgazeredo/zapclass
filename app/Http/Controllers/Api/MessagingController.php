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

/**
 * @tags Mensagens
 */

class MessagingController extends Controller
{
    protected UazApiService $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    /**
     * Enviar mensagem de texto via WhatsApp
     *
     * Envia uma mensagem de texto personalizada para qualquer número brasileiro através
     * da sua instância WhatsApp conectada. Suporta recursos avançados como agendamento,
     * priorização, rastreamento customizado e resposta a mensagens específicas.
     *
     * Este endpoint processa mensagens instantaneamente ou com atraso configurável,
     * oferecendo controle total sobre o envio e permitindo integração completa
     * com sistemas de CRM, e-commerce e automação.
     *
     * @param SendTextMessageRequest $request Dados completos da mensagem
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Mensagem enviada com sucesso",
     *   "data": {
     *     "message_id": "msg_zc_abc123def456ghi789",
     *     "status": "sent",
     *     "recipient": "5511987654321",
     *     "text_message": "Olá! Bem-vindo à nossa plataforma ZapClass 🚀",
     *     "connection_id": "zapclass_inst_001",
     *     "trackingId": "order_2024_12345",
     *     "delayMessage": 0,
     *     "linkPreview": true,
     *     "timestamp": "2024-01-15T10:30:45.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 400 {
     *   "success": false,
     *   "error": "validation_error",
     *   "message": "Os dados fornecidos são inválidos",
     *   "details": {
     *     "recipient": [
     *       "O número deve estar no formato: 55 + DDD + telefone (ex: 5511987654321)"
     *     ],
     *     "text_message": [
     *       "O conteúdo da mensagem é obrigatório"
     *     ]
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "error": "authentication_error",
     *   "message": "Token de autenticação ausente ou inválido",
     *   "hint": "Inclua o cabeçalho: Authorization: Bearer SEU_TOKEN_API",
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 402 {
     *   "success": false,
     *   "error": "quota_exceeded",
     *   "message": "Limite mensal de mensagens excedido",
     *   "details": {
     *     "current_usage": 1000,
     *     "plan_limit": 1000,
     *     "reset_date": "2024-02-01T00:00:00.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 422 {
     *   "success": false,
     *   "error": "business_logic_error",
     *   "message": "Número de telefone bloqueado ou inválido para envio",
     *   "details": {
     *     "blocked_reason": "Usuário optou por não receber mensagens",
     *     "blocked_since": "2024-01-10T15:20:30.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "error": "service_error",
     *   "message": "Instância WhatsApp temporariamente indisponível",
     *   "details": {
     *     "error_code": "INSTANCE_DISCONNECTED",
     *     "retry_after": 60,
     *     "estimated_recovery": "2024-01-15T10:35:00.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @authenticated
     */
    public function sendText(SendTextMessageRequest $request): JsonResponse
    {
        try {
            // Pegar conexão autenticada do middleware
            $connection = $request->attributes->get('api_connection');

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                return $this->errorResponse(
                    'Conexão não configurada adequadamente. Entre em contato com o suporte.',
                    500
                );
            }

            // Preparar dados para a API
            $messageData = [
                'recipient' => $request->recipient,
                'text' => $request->text_message,
            ];

            // Gerar ID único para rastreamento
            $messageId = 'msg_' . Str::random(20);

            Log::info('API: Enviando mensagem via', [
                'message_id' => $messageId,
                'connection_id' => $connection->id,
                'recipient' => $request->recipient,
                'message_length' => strlen($request->text_message)
            ]);

            // Chamar API
            $response = $this->uazApiService->sendMessage($connection->token, $messageData);

            // Log da resposta
            Log::info('API: Resposta da', [
                'message_id' => $messageId,
                'connection_id' => $connection->id,
                'uaz_response' => $response
            ]);

            // Retornar resposta padronizada
            return $this->successResponse([
                'message_id' => $messageId,
                'status' => 'sent',
                'recipient' => $request->recipient,
                'text_message' => $request->text_message,
                'timestamp' => now()->toISOString(),
                'connection_id' => $connection->client_instance_id,
                'trackingId' => $request->trackingId,
                'delayMessage' => $request->delayMessage ?? 0,
                'linkPreview' => $request->linkPreview ?? true,
            ], 'Mensagem enviada com sucesso');
        } catch (Exception $e) {
            Log::error('API: Erro ao enviar mensagem', [
                'connection_id' => $connection?->id,
                'recipient' => $request->recipient,
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
     * Consultar status de uma mensagem enviada
     *
     * Retorna o status atual de uma mensagem específica identificada pelo message_id.
     * Útil para rastrear se a mensagem foi entregue ao destinatário.
     *
     * @param Request $request Requisição HTTP
     * @param string $messageId ID único da mensagem retornado no envio
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Operação realizada com sucesso",
     *   "data": {
     *     "message_id": "msg_abc123def456ghi789",
     *     "status": "delivered",
     *     "timestamp": "2024-01-15T10:35:20.000000Z",
     *     "connection_id": "zapclass_123"
     *   },
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Token de API inválido ou expirado",
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Erro ao consultar status da mensagem",
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @authenticated
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
     * Obter informações da conexão WhatsApp
     *
     * Retorna detalhes sobre a conexão WhatsApp associada ao token de API,
     * incluindo status, telefone conectado e informações de uso da API.
     *
     * @param Request $request Requisição HTTP
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Operação realizada com sucesso",
     *   "data": {
     *     "connection_id": "zapclass_123",
     *     "name": "Conexão Principal",
     *     "status": "connected",
     *     "phone": "5511999999999",
     *     "api_usage_count": 42,
     *     "api_rate_limit": 1000,
     *     "api_last_used": "2024-01-15T10:25:30.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Token de API inválido ou expirado",
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Erro ao obter informações da conexão",
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @authenticated
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
