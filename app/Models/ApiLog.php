<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiLog extends Model
{
    protected $fillable = [
        'trace_id',
        'direction',
        'tenant_id',
        'user_id',
        'whats_app_connection_id',
        'method',
        'url',
        'endpoint',
        'ip',
        'user_agent',
        'request_headers',
        'request_body',
        'response_headers',
        'response_body',
        'status_code',
        'is_error',
        'error_message',
        'response_time_ms',
        'action',
        'metadata',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'response_headers' => 'array',
        'metadata' => 'array',
        'is_error' => 'boolean',
        'response_time_ms' => 'integer',
        'status_code' => 'integer',
    ];

    /**
     * Relacionamentos
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function whatsAppConnection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class);
    }

    /**
     * Scopes
     */
    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    public function scopeErrors($query)
    {
        return $query->where('is_error', true);
    }

    public function scopeByTraceId($query, string $traceId)
    {
        return $query->where('trace_id', $traceId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeSlowRequests($query, int $thresholdMs = 1000)
    {
        return $query->where('response_time_ms', '>', $thresholdMs);
    }

    /**
     * Helpers
     */
    public function isSuccessful(): bool
    {
        return !$this->is_error && $this->status_code >= 200 && $this->status_code < 300;
    }

    public function isSlow(int $thresholdMs = 1000): bool
    {
        return $this->response_time_ms > $thresholdMs;
    }
}
