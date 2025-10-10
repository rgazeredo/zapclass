<?php

namespace App\Http\Middleware;

use App\Services\ApiLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiLoggerMiddleware
{
    protected ApiLogger $logger;

    public function __construct(ApiLogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ignorar rotas que não precisam de logging (health check, assets, etc)
        if ($this->shouldSkipLogging($request)) {
            return $next($request);
        }

        // Gerar trace_id para rastrear toda a requisição
        $traceId = $this->logger->getTraceId();

        // Adicionar trace_id no request para uso posterior (ex: em outbound requests)
        $request->attributes->set('trace_id', $traceId);

        // Iniciar timer
        $this->logger->startTimer();

        // Executar a requisição
        $response = $next($request);

        // Logar a requisição inbound (de forma assíncrona para não bloquear)
        try {
            $this->logger->logInbound(
                request: $request,
                response: $response,
                action: $this->getActionName($request),
                metadata: $this->getMetadata($request)
            );
        } catch (\Throwable $e) {
            // Se falhar o log, não quebrar a aplicação
            \Log::error('Failed to log inbound request', [
                'error' => $e->getMessage(),
                'trace_id' => $traceId
            ]);
        }

        // Adicionar trace_id no header da resposta (útil para debugging)
        $response->headers->set('X-Trace-ID', $traceId);

        return $response;
    }

    /**
     * Verificar se deve pular o logging desta requisição
     */
    protected function shouldSkipLogging(Request $request): bool
    {
        $skipPaths = [
            'sanctum/csrf-cookie',
            'up', // health check
            '_ignition', // debug
        ];

        foreach ($skipPaths as $path) {
            if ($request->is($path)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obter nome da ação baseado na rota
     */
    protected function getActionName(Request $request): ?string
    {
        $route = $request->route();

        if ($route) {
            // Tentar pegar o nome da rota
            $routeName = $route->getName();
            if ($routeName) {
                return $routeName;
            }

            // Tentar pegar o action
            $action = $route->getActionName();
            if ($action && $action !== 'Closure') {
                return $action;
            }
        }

        // Fallback: usar método + path
        return $request->method() . ' ' . $request->path();
    }

    /**
     * Obter metadados relevantes da requisição
     */
    protected function getMetadata(Request $request): array
    {
        $metadata = [];

        // Route parameters
        if ($route = $request->route()) {
            $metadata['route_params'] = $route->parameters();
        }

        // Query parameters (sem dados sensíveis)
        if ($request->query()) {
            $metadata['query_params'] = $request->query();
        }

        return $metadata;
    }
}
