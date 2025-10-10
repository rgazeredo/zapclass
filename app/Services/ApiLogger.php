<?php

namespace App\Services;

use App\Models\ApiLog;
use App\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class ApiLogger
{
    private ?string $traceId = null;
    private ?int $startTime = null;

    /**
     * Gerar ou obter o trace ID atual
     */
    public function getTraceId(): string
    {
        if (!$this->traceId) {
            $this->traceId = (string) Str::uuid();
        }

        return $this->traceId;
    }

    /**
     * Definir um trace ID customizado
     */
    public function setTraceId(string $traceId): self
    {
        $this->traceId = $traceId;
        return $this;
    }

    /**
     * Iniciar timer para calcular tempo de resposta
     */
    public function startTimer(): self
    {
        $this->startTime = hrtime(true);
        return $this;
    }

    /**
     * Calcular tempo decorrido em milissegundos
     */
    private function getElapsedTimeMs(): ?int
    {
        if (!$this->startTime) {
            return null;
        }

        $elapsed = hrtime(true) - $this->startTime;
        return (int) ($elapsed / 1_000_000); // Converter nanosegundos para milissegundos
    }

    /**
     * Logar requisição INBOUND (Cliente -> Nossa API)
     */
    public function logInbound(
        Request $request,
        $response,
        ?string $action = null,
        ?array $metadata = null
    ): ApiLog {
        $statusCode = $this->extractStatusCode($response);
        $isError = $statusCode >= 400;

        return ApiLog::create([
            'trace_id' => $this->getTraceId(),
            'direction' => 'inbound',
            'tenant_id' => Auth::user()?->tenant_id,
            'user_id' => Auth::id(),
            'whats_app_connection_id' => $metadata['whats_app_connection_id'] ?? null,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'endpoint' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_headers' => $this->sanitizeHeaders($request->headers->all()),
            'request_body' => $this->sanitizeBody($request->all()),
            'response_headers' => $this->extractResponseHeaders($response),
            'response_body' => $this->extractResponseBody($response),
            'status_code' => $statusCode,
            'is_error' => $isError,
            'error_message' => $isError ? $this->extractErrorMessage($response) : null,
            'response_time_ms' => $this->getElapsedTimeMs(),
            'action' => $action,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Logar requisição OUTBOUND (Nossa API -> UazAPI)
     */
    public function logOutbound(
        string $method,
        string $url,
        array $requestHeaders,
        $requestBody,
        $response,
        ?string $action = null,
        ?WhatsAppConnection $connection = null,
        ?array $metadata = null
    ): ApiLog {
        $statusCode = $this->extractStatusCode($response);
        $isError = $statusCode >= 400;

        return ApiLog::create([
            'trace_id' => $this->getTraceId(),
            'direction' => 'outbound',
            'tenant_id' => $connection?->tenant_id ?? Auth::user()?->tenant_id,
            'user_id' => Auth::id(),
            'whats_app_connection_id' => $connection?->id,
            'method' => strtoupper($method),
            'url' => $url,
            'endpoint' => parse_url($url, PHP_URL_PATH),
            'ip' => null,
            'user_agent' => null,
            'request_headers' => $this->sanitizeHeaders($requestHeaders),
            'request_body' => $this->sanitizeBody($requestBody),
            'response_headers' => $this->extractResponseHeaders($response),
            'response_body' => $this->extractResponseBody($response),
            'status_code' => $statusCode,
            'is_error' => $isError,
            'error_message' => $isError ? $this->extractErrorMessage($response) : null,
            'response_time_ms' => $this->getElapsedTimeMs(),
            'action' => $action,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Logar erro de exception (quando nem resposta HTTP existe)
     */
    public function logException(
        string $direction,
        string $method,
        string $url,
        array $requestHeaders,
        $requestBody,
        \Throwable $exception,
        ?string $action = null,
        ?WhatsAppConnection $connection = null,
        ?array $metadata = null
    ): ApiLog {
        return ApiLog::create([
            'trace_id' => $this->getTraceId(),
            'direction' => $direction,
            'tenant_id' => $connection?->tenant_id ?? Auth::user()?->tenant_id,
            'user_id' => Auth::id(),
            'whats_app_connection_id' => $connection?->id,
            'method' => strtoupper($method),
            'url' => $url,
            'endpoint' => parse_url($url, PHP_URL_PATH),
            'ip' => null,
            'user_agent' => null,
            'request_headers' => $this->sanitizeHeaders($requestHeaders),
            'request_body' => $this->sanitizeBody($requestBody),
            'response_headers' => null,
            'response_body' => null,
            'status_code' => null,
            'is_error' => true,
            'error_message' => $exception->getMessage(),
            'response_time_ms' => $this->getElapsedTimeMs(),
            'action' => $action,
            'metadata' => array_merge($metadata ?? [], [
                'exception_class' => get_class($exception),
                'exception_file' => $exception->getFile(),
                'exception_line' => $exception->getLine(),
            ]),
        ]);
    }

    /**
     * Sanitizar headers removendo dados sensíveis
     */
    private function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = ['authorization', 'token', 'admintoken', 'cookie', 'x-api-key'];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = '***REDACTED***';
            }
        }

        return $headers;
    }

    /**
     * Sanitizar body removendo dados sensíveis
     */
    private function sanitizeBody($body): ?string
    {
        if (empty($body)) {
            return null;
        }

        // Se for array, converter para JSON
        if (is_array($body)) {
            // Remover campos sensíveis
            $sensitiveFields = ['password', 'token', 'secret', 'api_key', 'credit_card'];
            foreach ($sensitiveFields as $field) {
                if (isset($body[$field])) {
                    $body[$field] = '***REDACTED***';
                }
            }
            return json_encode($body, JSON_UNESCAPED_UNICODE);
        }

        return (string) $body;
    }

    /**
     * Extrair status code da resposta
     */
    private function extractStatusCode($response): ?int
    {
        if (is_object($response) && method_exists($response, 'status')) {
            return $response->status();
        }

        if (is_object($response) && method_exists($response, 'getStatusCode')) {
            return $response->getStatusCode();
        }

        return null;
    }

    /**
     * Extrair headers da resposta
     */
    private function extractResponseHeaders($response): ?array
    {
        if (is_object($response) && method_exists($response, 'headers')) {
            $headers = $response->headers();
            if (is_object($headers) && method_exists($headers, 'all')) {
                return $this->sanitizeHeaders($headers->all());
            }
            if (is_array($headers)) {
                return $this->sanitizeHeaders($headers);
            }
        }

        return null;
    }

    /**
     * Extrair body da resposta
     */
    private function extractResponseBody($response): ?string
    {
        if (is_object($response) && method_exists($response, 'body')) {
            return $response->body();
        }

        if (is_object($response) && method_exists($response, 'getContent')) {
            return $response->getContent();
        }

        if (is_string($response)) {
            return $response;
        }

        return null;
    }

    /**
     * Extrair mensagem de erro da resposta
     */
    private function extractErrorMessage($response): ?string
    {
        $body = $this->extractResponseBody($response);

        if ($body) {
            $json = json_decode($body, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $json['message'] ?? $json['error'] ?? 'Unknown error';
            }
            return substr($body, 0, 500); // Limitar tamanho
        }

        return null;
    }
}
