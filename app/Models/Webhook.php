<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Webhook extends Model
{
    protected $table = 'whatsapp_webhooks';

    protected $fillable = [
        'whatsapp_connection_id',
        'url',
        'webhook_code',
        'events',
        'exclude_events',
        'custom_headers',
        'enabled',
        'synced',
        'external_webhook_id',
    ];

    protected $casts = [
        'events' => 'array',
        'exclude_events' => 'array',
        'custom_headers' => 'array',
        'enabled' => 'boolean',
        'synced' => 'boolean',
    ];

    public function whatsappConnection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
