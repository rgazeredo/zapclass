<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('uaz_api_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nome identificador do plano (ex: "Plano Principal")
            $table->string('base_url'); // URL base da API
            $table->text('admin_token'); // Token de admin (será criptografado)
            $table->integer('max_connections')->default(300); // Limite de conexões do plano
            $table->integer('current_connections')->default(0); // Conexões em uso
            $table->boolean('is_active')->default(true); // Se a conta está ativa
            $table->text('notes')->nullable(); // Observações sobre o plano
            $table->timestamps();

            // Índices para performance
            $table->index('is_active');
            $table->index(['is_active', 'current_connections']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uaz_api_accounts');
    }
};
