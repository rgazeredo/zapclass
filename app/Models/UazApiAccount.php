<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class UazApiAccount extends Model
{
    protected $fillable = [
        'name',
        'base_url',
        'admin_token',
        'max_connections',
        'current_connections',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_connections' => 'integer',
        'current_connections' => 'integer',
    ];

    /**
     * Relacionamento com conexões WhatsApp
     */
    public function connections(): HasMany
    {
        return $this->hasMany(WhatsAppConnection::class, 'uaz_api_account_id');
    }

    /**
     * Accessor para descriptografar o token
     */
    public function getAdminTokenAttribute($value): string
    {
        return Crypt::decryptString($value);
    }

    /**
     * Mutator para criptografar o token
     */
    public function setAdminTokenAttribute($value): void
    {
        $this->attributes['admin_token'] = Crypt::encryptString($value);
    }

    /**
     * Verifica se a conta tem slots disponíveis
     */
    public function hasAvailableSlots(): bool
    {
        return $this->is_active && $this->current_connections < $this->max_connections;
    }

    /**
     * Retorna o número de slots disponíveis
     */
    public function availableSlots(): int
    {
        return max(0, $this->max_connections - $this->current_connections);
    }

    /**
     * Busca uma conta ativa com slots disponíveis
     */
    public static function findAvailableAccount(): ?self
    {
        return self::where('is_active', true)
            ->whereColumn('current_connections', '<', 'max_connections')
            ->orderBy('current_connections', 'asc') // Prioriza contas com menos uso
            ->first();
    }

    /**
     * Incrementa o contador de conexões
     */
    public function incrementConnections(): bool
    {
        if (!$this->hasAvailableSlots()) {
            return false;
        }

        return $this->increment('current_connections') > 0;
    }

    /**
     * Decrementa o contador de conexões
     */
    public function decrementConnections(): bool
    {
        if ($this->current_connections <= 0) {
            return false;
        }

        return $this->decrement('current_connections') > 0;
    }
}
