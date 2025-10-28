<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * @tags Autenticação
 */
class CheckController extends Controller
{
    /**
     * Validar API Key
     *
     * Endpoint simples para validar se a API Key fornecida é válida e está ativa.
     * Se a requisição chegar até este método, significa que o middleware de autenticação
     * já validou o token com sucesso.
     *
     * @param Request $request Requisição HTTP
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "API Key válida"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "message": "Token de autenticação inválido"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "message": "Erro interno do servidor"
     * }
     *
     * @authenticated
     */
    public function check(Request $request): JsonResponse
    {
        try {
            // Se chegou até aqui, o middleware ApiAuthentication já validou o token
            // Portanto, podemos retornar sucesso diretamente
            return response()->json([
                'success' => true,
                'message' => 'API Key válida'
            ], 200);
        } catch (Exception $e) {
            Log::error('API: Erro ao validar API Key', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }
}
