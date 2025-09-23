<?php

namespace App\Http\Middleware;

use App\Models\WhatsAppConnection;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthentication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extrair token do header Authorization
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->unauthorizedResponse('Token de autorização não fornecido');
        }

        $clientToken = substr($authHeader, 7); // Remove "Bearer "

        // Validar formato do token
        if (!str_starts_with($clientToken, 'zt_')) {
            return $this->unauthorizedResponse('Formato de token inválido');
        }

        // Buscar conexão por token (com cache de 5 minutos)
        $cacheKey = "api_connection_{$clientToken}";
        $connection = Cache::remember($cacheKey, 300, function () use ($clientToken) {
            return WhatsAppConnection::findByClientCredentials($clientToken);
        });

        if (!$connection) {
            Log::warning('API: Token inválido usado', [
                'token' => substr($clientToken, 0, 10) . '...',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return $this->unauthorizedResponse('Token inválido ou desabilitado');
        }

        // Verificar se a conexão está ativa
        if (!$connection->isApiEnabled()) {
            return $this->unauthorizedResponse('Acesso à API desabilitado para esta conexão');
        }

        // Verificar se a instância está conectada
        if (!$connection->isConnected()) {
            return $this->errorResponse('Instância não está conectada ao WhatsApp', 503);
        }

        // Rate limiting (simples por minuto)
        $rateLimitKey = "api_rate_limit_{$connection->id}";
        $currentRequests = Cache::get($rateLimitKey, 0);

        if ($currentRequests >= $connection->api_rate_limit) {
            Log::info('API: Rate limit excedido', [
                'connection_id' => $connection->id,
                'limit' => $connection->api_rate_limit,
                'current' => $currentRequests
            ]);

            return $this->errorResponse('Rate limit excedido. Tente novamente em alguns segundos.', 429);
        }

        // Incrementar contador de rate limiting
        Cache::put($rateLimitKey, $currentRequests + 1, 60); // 60 segundos

        // Adicionar conexão ao request para uso no controller
        $request->attributes->set('api_connection', $connection);

        // Log da requisição
        Log::info('API: Requisição autenticada', [
            'connection_id' => $connection->id,
            'tenant_id' => $connection->tenant_id,
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip()
        ]);

        // Atualizar tracking de uso (assíncrono para não impactar performance)
        dispatch(function () use ($connection) {
            $connection->trackApiUsage();
        })->afterResponse();

        return $next($request);
    }

    /**
     * Resposta de não autorizado
     */
    private function unauthorizedResponse(string $message): Response
    {
        return response()->json([
            'success' => false,
            'error' => 'unauthorized',
            'message' => $message
        ], 401);
    }

    /**
     * Resposta de erro genérica
     */
    private function errorResponse(string $message, int $status = 400): Response
    {
        return response()->json([
            'success' => false,
            'error' => 'api_error',
            'message' => $message
        ], $status);
    }
}
