<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Mensagens V2
 */
class MessagingController extends Controller
{
    /**
     * Enviar mensagem avançada (V2)
     *
     * Versão 2.0 da API com recursos avançados como múltiplos tipos de mensagem,
     * scheduling avançado, e templates personalizados.
     *
     * @param Request $request
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Mensagem V2 enviada com sucesso",
     *   "data": {
     *     "message_id": "v2_msg_abc123",
     *     "version": "2.0.0",
     *     "features": ["templates", "scheduling", "multimedia"]
     *   }
     * }
     *
     * @authenticated
     */
    public function sendAdvancedMessage(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Mensagem V2 enviada com sucesso',
            'data' => [
                'message_id' => 'v2_msg_' . uniqid(),
                'version' => '2.0.0',
                'features' => ['templates', 'scheduling', 'multimedia'],
                'timestamp' => now()->toISOString()
            ]
        ]);
    }
}
