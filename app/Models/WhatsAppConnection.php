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
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
