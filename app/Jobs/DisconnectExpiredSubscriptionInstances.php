<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Services\UazApiService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DisconnectExpiredSubscriptionInstances implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = [30, 60, 120];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $tenantId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(UazApiService $uazApiService): void
    {
        Log::info('Iniciando desconexão de instâncias por assinatura vencida', [
            'tenant_id' => $this->tenantId
        ]);

        $tenant = Tenant::find($this->tenantId);

        if (!$tenant) {
            Log::warning('Tenant não encontrado para desconexão', [
                'tenant_id' => $this->tenantId
            ]);
            return;
        }

        // Verificar se realmente não tem assinatura ativa
        if ($tenant->hasActiveSubscription()) {
            Log::info('Tenant possui assinatura ativa, cancelando desconexão', [
                'tenant_id' => $this->tenantId,
                'tenant_name' => $tenant->name
            ]);
            return;
        }

        // Buscar todas as conexões WhatsApp conectadas do tenant
        $connections = $tenant->whatsappConnections()
            ->where('status', 'connected')
            ->get();

        if ($connections->isEmpty()) {
            Log::info('Nenhuma instância conectada para desconectar', [
                'tenant_id' => $this->tenantId
            ]);
            return;
        }

        Log::info('Desconectando instâncias', [
            'tenant_id' => $this->tenantId,
            'total_connections' => $connections->count()
        ]);

        $successCount = 0;
        $errorCount = 0;

        foreach ($connections as $connection) {
            try {
                // Desconectar instância via UazAPI
                $uazApiService->disconnectInstance($connection->token);

                // Atualizar status no banco
                $connection->update([
                    'status' => 'disconnected'
                ]);

                // Desabilitar API
                $connection->disableApi();

                Log::info('Instância desconectada com sucesso', [
                    'connection_id' => $connection->id,
                    'connection_name' => $connection->name,
                    'tenant_id' => $this->tenantId
                ]);

                $successCount++;
            } catch (Exception $e) {
                Log::error('Erro ao desconectar instância', [
                    'connection_id' => $connection->id,
                    'connection_name' => $connection->name,
                    'tenant_id' => $this->tenantId,
                    'error' => $e->getMessage()
                ]);

                $errorCount++;
            }
        }

        // Desativar tenant
        $tenant->update([
            'is_active' => false
        ]);

        Log::info('Processo de desconexão finalizado', [
            'tenant_id' => $this->tenantId,
            'total_connections' => $connections->count(),
            'success_count' => $successCount,
            'error_count' => $errorCount
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        Log::error('Job de desconexão falhou após todas as tentativas', [
            'tenant_id' => $this->tenantId,
            'error' => $exception->getMessage()
        ]);
    }
}
