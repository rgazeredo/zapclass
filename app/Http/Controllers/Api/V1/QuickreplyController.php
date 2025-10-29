<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendTextMessageRequest;
use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * @tags Mensagens
 */

class QuickreplyController extends Controller
{
    protected UazApiService $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    public function create(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'short_cut' => 'required|string',
                'type' => 'required|string',
                'text' => 'nullable|string',
                'file' => 'nullable|string',
                'doc_name' => 'nullable|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            // Gerar ID único para rastreamento
            $messageId = Str::random(20);

            // Chamar API
            // $response = $this->uazApiService->messagesText($connection, $request->all());

            return response()->json(['success' => true, 'message_id' => $messageId], 200);
        } catch (Exception $e) {
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function list(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Gerar ID único para rastreamento
            $messageId = Str::random(20);

            // Chamar API
            // $response = $this->uazApiService->messagesText($connection, $request->all());

            return response()->json(['success' => true, 'message_id' => $messageId], 200);
        } catch (Exception $e) {
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }


    public function edit(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'required|string',
                'short_cut' => 'nullable|string',
                'type' => 'nullable|string',
                'text' => 'nullable|string',
                'file' => 'nullable|string',
                'doc_name' => 'nullable|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            // Gerar ID único para rastreamento
            $messageId = Str::random(20);

            // Chamar API
            // $response = $this->uazApiService->messagesText($connection, $request->all());

            return response()->json(['success' => true, 'message_id' => $messageId], 200);
        } catch (Exception $e) {
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function delete(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'required|string',

            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            // Gerar ID único para rastreamento
            $messageId = Str::random(20);

            // Chamar API
            // $response = $this->uazApiService->messagesText($connection, $request->all());

            return response()->json(['success' => true, 'message_id' => $messageId], 200);
        } catch (Exception $e) {
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
