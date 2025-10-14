<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class WhatsAppConnection extends Model
{
    use LogsActivity;
    protected $table = 'whatsapp_connections';

    protected $fillable = [
        'tenant_id',
        'uaz_api_account_id',
        'name',
        'system_name',
        'admin_field_1',
        'admin_field_2',
        'phone',
        'status',
        'token',
        'instance_id',
        'api_key',
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

    public function uazApiAccount(): BelongsTo
    {
        return $this->belongsTo(UazApiAccount::class, 'uaz_api_account_id');
    }

    public function webhooks(): HasMany
    {
        return $this->hasMany(Webhook::class, 'whatsapp_connection_id');
    }

    /**
     * Get the full instance name for API
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
     * Generate API key for API access
     */
    public function generateApiKey(): void
    {
        $this->api_key = 'zc_' . Str::random(61); // zc = ZapClass (total 64 chars)
        $this->save();
    }

    /**
     * Check if this connection is enabled for API usage
     */
    public function isApiEnabled(): bool
    {
        return $this->api_enabled && !empty($this->api_key);
    }

    /**
     * Enable API access for this connection
     */
    public function enableApi(int $rateLimit = 100): void
    {
        if (empty($this->api_key)) {
            $this->generateApiKey();
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
     * Get masked API key for display
     */
    public function getMaskedApiKeyAttribute(): string
    {
        if (!$this->api_key) {
            return '';
        }

        $start = substr($this->api_key, 0, 8);
        $end = substr($this->api_key, -8);
        $middle = str_repeat('*', max(0, strlen($this->api_key) - 16));

        return $start . $middle . $end;
    }

    /**
     * Regenerate API key
     */
    public function regenerateApiKey(): void
    {
        $this->generateApiKey();
    }

    /**
     * Scope: Only API enabled connections
     */
    public function scopeApiEnabled($query)
    {
        return $query->where('api_enabled', true)
            ->whereNotNull('api_key');
    }

    /**
     * Find connection by API key
     */
    public static function findByApiKey(string $apiKey)
    {
        return static::where('api_key', $apiKey)
            ->where('api_enabled', true)
            ->first();
    }

    /**
     * Configure activity log
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'status',
                'phone',
                'admin_field_1',
                'admin_field_2',
                'api_enabled',
                'api_rate_limit',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => match($eventName) {
                'created' => 'Conexão WhatsApp criada',
                'updated' => 'Conexão WhatsApp atualizada',
                'deleted' => 'Conexão WhatsApp deletada',
                default => "Conexão WhatsApp {$eventName}"
            });
    }
}
