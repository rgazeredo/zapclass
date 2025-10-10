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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('trace_id')->index()->comment('UUID para rastrear todo o fluxo da requisição');

            // Tipo de request: inbound (cliente->nossa API) ou outbound (nossa API->UazAPI)
            $table->enum('direction', ['inbound', 'outbound'])->index();

            // Informações do usuário/tenant
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedBigInteger('whats_app_connection_id')->nullable()->index();

            // Request Info
            $table->string('method', 10)->comment('GET, POST, PUT, DELETE, etc');
            $table->text('url')->comment('URL completa da requisição');
            $table->string('endpoint', 500)->nullable()->comment('Endpoint sem query params');
            $table->string('ip', 45)->nullable()->comment('IP do cliente (apenas inbound)');
            $table->string('user_agent', 500)->nullable()->comment('User agent (apenas inbound)');

            // Request/Response Data
            $table->json('request_headers')->nullable()->comment('Headers da requisição');
            $table->longText('request_body')->nullable()->comment('Body da requisição');
            $table->json('response_headers')->nullable()->comment('Headers da resposta');
            $table->longText('response_body')->nullable()->comment('Body da resposta');

            // Status e Performance
            $table->integer('status_code')->nullable()->comment('HTTP status code');
            $table->boolean('is_error')->default(false)->index()->comment('Se houve erro');
            $table->text('error_message')->nullable()->comment('Mensagem de erro se houver');
            $table->integer('response_time_ms')->nullable()->comment('Tempo de resposta em ms');

            // Metadados
            $table->string('action', 100)->nullable()->comment('Ação executada (ex: create_instance, send_message)');
            $table->json('metadata')->nullable()->comment('Dados extras relevantes');

            $table->timestamps();

            // Indexes para queries comuns
            $table->index(['tenant_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['whats_app_connection_id', 'created_at']);
            $table->index(['is_error', 'created_at']);
            $table->index(['direction', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
