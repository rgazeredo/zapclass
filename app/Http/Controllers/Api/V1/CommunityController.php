<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\UazApiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * @tags Comunidades
 */
class CommunityController extends Controller
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

            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->communityCreate($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao criar comunidade', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao criar comunidade: ' . $e->getMessage(), 500);
        }
    }

    public function editGroups(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            $validator = Validator::make($request->all(), [
                'community' => 'required|string',
                'action' => 'required|string|in:add,remove',
                'groupjids' => 'required|array',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->communityEditGroups($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao editar grupos da comunidade', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao editar grupos da comunidade: ' . $e->getMessage(), 500);
        }
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
