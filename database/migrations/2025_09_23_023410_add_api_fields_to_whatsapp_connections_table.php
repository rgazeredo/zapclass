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
            // Campos para API interna
            $table->string('client_token', 64)->unique()->nullable()->after('instance_id')
                ->comment('Token para autenticação dos clientes na nossa API');
            $table->string('client_instance_id', 32)->unique()->nullable()->after('client_token')
                ->comment('Instance ID para os clientes da nossa API');

            // Controles de API
            $table->boolean('api_enabled')->default(false)->after('client_instance_id')
                ->comment('Se esta conexão está habilitada para uso via API');
            $table->integer('api_rate_limit')->default(100)->after('api_enabled')
                ->comment('Limite de requests por minuto para esta conexão');

            // Tracking de uso
            $table->timestamp('api_last_used_at')->nullable()->after('api_rate_limit')
                ->comment('Última vez que a API foi usada');
            $table->integer('api_usage_count')->default(0)->after('api_last_used_at')
                ->comment('Contador total de requests feitos');

            // Índices para performance
            $table->index(['client_token', 'api_enabled'], 'idx_client_token_enabled');
            $table->index(['tenant_id', 'api_enabled'], 'idx_tenant_api_enabled');
            $table->index('client_instance_id', 'idx_client_instance_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            // Remove índices primeiro
            $table->dropIndex('idx_client_token_enabled');
            $table->dropIndex('idx_tenant_api_enabled');
            $table->dropIndex('idx_client_instance_id');

            // Remove colunas
            $table->dropColumn([
                'client_token',
                'client_instance_id',
                'api_enabled',
                'api_rate_limit',
                'api_last_used_at',
                'api_usage_count'
            ]);
        });
    }
};
