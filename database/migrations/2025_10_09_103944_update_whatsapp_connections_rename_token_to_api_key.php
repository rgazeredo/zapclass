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
            // Remove índices que usam as colunas antigas
            $table->dropIndex('idx_client_token_enabled');
            $table->dropIndex('idx_client_instance_id');
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Remove a coluna client_instance_id
            $table->dropColumn('client_instance_id');

            // Renomeia client_token para api_key
            $table->renameColumn('client_token', 'api_key');
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Recria o índice com o novo nome da coluna
            $table->index(['api_key', 'api_enabled'], 'idx_api_key_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Remove o novo índice
            $table->dropIndex('idx_api_key_enabled');
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Renomeia api_key de volta para client_token
            $table->renameColumn('api_key', 'client_token');

            // Adiciona de volta a coluna client_instance_id
            $table->string('client_instance_id', 32)->unique()->nullable()->after('client_token')
                ->comment('Instance ID para os clientes da nossa API');
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Recria os índices originais
            $table->index(['client_token', 'api_enabled'], 'idx_client_token_enabled');
            $table->index('client_instance_id', 'idx_client_instance_id');
        });
    }
};
