<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
