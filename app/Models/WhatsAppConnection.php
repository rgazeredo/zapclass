<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WhatsAppConnection extends Model
{
    protected $table = 'whatsapp_connections';

    protected $fillable = [
        'tenant_id',
        'name',
        'system_name',
        'admin_field_1',
        'admin_field_2',
        'phone',
        'status',
        'token',
        'instance_id',
        'client_token',
        'client_instance_id',
        'api_enabled',
        'api_rate_limit',
        'api_last_used_at',
        'api_usage_count',
    ];

    protected $casts = [
        'api_enabled' => 'boolean',
        'api_last_used_at' => 'datetime',
        'api_rate_limit' => 'integer',
        'api_usage_count' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the full instance name for UAZ API
     */
    public function getInstanceNameAttribute(): string
    {
        return $this->tenant->slug . '_' . $this->system_name;
    }

    /**
     * Check if connection is active
     */
    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    /**
     * Check if connection is being created
     */
    public function isCreating(): bool
    {
        return in_array($this->status, ['creating', 'connecting']);
    }

    /**
     * Check if connection has an error
     */
    public function hasError(): bool
    {
        return $this->status === 'error';
    }

    // ========================================
    // API METHODS
    // ========================================

    /**
     * Generate client credentials for API access
     */
    public function generateClientCredentials(): void
    {
        $this->client_token = 'zt_' . Str::random(48); // zt = ZapToken
        $this->client_instance_id = 'zi_' . Str::random(24); // zi = ZapInstance
        $this->save();
    }

    /**
     * Check if this connection is enabled for API usage
     */
    public function isApiEnabled(): bool
    {
        return $this->api_enabled && !empty($this->client_token) && !empty($this->client_instance_id);
    }

    /**
     * Enable API access for this connection
     */
    public function enableApi(int $rateLimit = 100): void
    {
        if (empty($this->client_token) || empty($this->client_instance_id)) {
            $this->generateClientCredentials();
        }

        $this->api_enabled = true;
        $this->api_rate_limit = $rateLimit;
        $this->save();
    }

    /**
     * Disable API access for this connection
     */
    public function disableApi(): void
    {
        $this->api_enabled = false;
        $this->save();
    }

    /**
     * Update API usage tracking
     */
    public function trackApiUsage(): void
    {
        $this->api_last_used_at = now();
        $this->api_usage_count = ($this->api_usage_count ?? 0) + 1;
        $this->save();
    }

    /**
     * Get masked client token for display
     */
    public function getMaskedClientTokenAttribute(): string
    {
        if (!$this->client_token) {
            return '';
        }

        $start = substr($this->client_token, 0, 8);
        $end = substr($this->client_token, -8);
        $middle = str_repeat('*', max(0, strlen($this->client_token) - 16));

        return $start . $middle . $end;
    }

    /**
     * Regenerate client credentials
     */
    public function regenerateClientCredentials(): void
    {
        $this->generateClientCredentials();
    }

    /**
     * Scope: Only API enabled connections
     */
    public function scopeApiEnabled($query)
    {
        return $query->where('api_enabled', true)
            ->whereNotNull('client_token')
            ->whereNotNull('client_instance_id');
    }

    /**
     * Find connection by client credentials
     */
    public static function findByClientCredentials(string $clientToken, ?string $clientInstanceId = null)
    {
        $query = static::where('client_token', $clientToken)
            ->where('api_enabled', true);

        if ($clientInstanceId) {
            $query->where('client_instance_id', $clientInstanceId);
        }

        return $query->first();
    }
}
