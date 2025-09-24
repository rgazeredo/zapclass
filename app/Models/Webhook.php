<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Webhook extends Model
{
    protected $table = 'webhooks';

    protected $fillable = [
        'whatsapp_connection_id',
        'url',
        'events',
        'exclude_events',
        'status',
        'synced',
        'external_webhook_id',
    ];

    protected $casts = [
        'events' => 'array',
        'exclude_events' => 'array',
        'synced' => 'boolean',
    ];

    public function whatsappConnection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
