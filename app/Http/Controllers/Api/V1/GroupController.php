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
 * @tags Grupos
 */
class GroupController extends Controller
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
                'participants' => 'required|array',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupCreate($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao criar grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao criar grupo: ' . $e->getMessage(), 500);
        }
    }

    public function list(Request $request): JsonResponse
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
                'force' => 'nullable|boolean',
                'no_participants' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupList($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao listar grupos', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao listar grupos: ' . $e->getMessage(), 500);
        }
    }

    public function info(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'get_invite_link' => 'nullable|boolean',
                'get_requests_participants' => 'nullable|boolean',
                'force' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupInfo($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao obter informações do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao obter informações do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateParticipants(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'action' => 'required|string|in:add,remove,promote,demote,approve,reject',
                'participants' => 'required|array',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateParticipants($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar participantes do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar participantes do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateName(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'name' => 'required|string|max:25',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateName($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar nome do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar nome do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateDescription(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'description' => 'required|string|max:512',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateDescription($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar descrição do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar descrição do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateImage(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'image' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateImage($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar imagem do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar imagem do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateLocked(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'locked' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateLocked($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar bloqueio do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar bloqueio do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function updateAnnounce(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
                'announce' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupUpdateAnnounce($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao atualizar anúncio do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao atualizar anúncio do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function inviteLink(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            // Usa groupInfo com get_invite_link=true para obter o link de convite
            $payload = $request->all();
            $payload['get_invite_link'] = true;

            $response = $this->uazApiService->groupInfo($connection, $payload);

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao obter link de convite do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao obter link de convite do grupo: ' . $e->getMessage(), 500);
        }
    }

    public function inviteInfo(Request $request): JsonResponse
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
                'invite_code' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupInviteInfo($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao obter informações do convite', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao obter informações do convite: ' . $e->getMessage(), 500);
        }
    }

    public function resetInvite(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupResetInviteCode($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao resetar código de convite', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao resetar código de convite: ' . $e->getMessage(), 500);
        }
    }

    public function join(Request $request): JsonResponse
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
                'invite_code' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupJoin($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao entrar no grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao entrar no grupo: ' . $e->getMessage(), 500);
        }
    }

    public function leave(Request $request): JsonResponse
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
                'groupjid' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->groupLeave($connection, $request->all());

            return response()->json(['success' => true, 'data' => $response], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao sair do grupo', ['error' => $e->getMessage()]);

            return $this->errorResponse('Erro ao sair do grupo: ' . $e->getMessage(), 500);
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
