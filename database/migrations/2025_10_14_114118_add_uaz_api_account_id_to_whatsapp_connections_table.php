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
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Adiciona coluna para relacionamento com a conta UazAPI
            $table->foreignId('uaz_api_account_id')
                ->nullable() // Nullable para permitir migração de dados existentes
                ->after('id')
                ->constrained('uaz_api_accounts')
                ->onDelete('restrict'); // Não permite deletar conta se houver conexões ativas

            // Índice para performance
            $table->index('uaz_api_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            $table->dropForeign(['uaz_api_account_id']);
            $table->dropIndex(['uaz_api_account_id']);
            $table->dropColumn('uaz_api_account_id');
        });
    }
};
