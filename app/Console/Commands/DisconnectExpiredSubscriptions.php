<?php

namespace App\Console\Commands;

use App\Jobs\DisconnectExpiredSubscriptionInstances;
use App\Models\Tenant;
use Illuminate\Console\Command;

class DisconnectExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:disconnect-expired
                            {--tenant= : ID específico do tenant para processar}
                            {--dry-run : Executar sem realizar alterações}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Desconecta instâncias WhatsApp de tenants com assinaturas vencidas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Iniciando verificação de assinaturas vencidas...');

        $query = Tenant::query()
            ->where('is_active', true)
            ->whereHas('whatsappConnections', function ($q) {
                $q->where('status', 'connected');
            });

        // Filtrar por tenant específico se fornecido
        if ($tenantId = $this->option('tenant')) {
            $query->where('id', $tenantId);
        }

        $tenants = $query->get();

        if ($tenants->isEmpty()) {
            $this->info('Nenhum tenant ativo com instâncias conectadas encontrado.');
            return Command::SUCCESS;
        }

        $this->info("Verificando {$tenants->count()} tenant(s)...");

        $expiredCount = 0;
        $activeCount = 0;

        foreach ($tenants as $tenant) {
            // Verificar se tem assinatura ativa
            $hasActiveSubscription = $tenant->hasActiveSubscription();
            $isOnTrial = $tenant->isOnTrial();

            if ($hasActiveSubscription || $isOnTrial) {
                $this->line("✓ {$tenant->name} - Assinatura ativa" . ($isOnTrial ? ' (Trial)' : ''));
                $activeCount++;
                continue;
            }

            // Tenant sem assinatura ativa
            $connectionsCount = $tenant->whatsappConnections()
                ->where('status', 'connected')
                ->count();

            $this->warn("✗ {$tenant->name} - Assinatura vencida ({$connectionsCount} instância(s) conectada(s))");
            $expiredCount++;

            if ($this->option('dry-run')) {
                $this->line('  [DRY-RUN] Job de desconexão não foi disparado');
                continue;
            }

            // Disparar job de desconexão
            DisconnectExpiredSubscriptionInstances::dispatch($tenant->id);
            $this->line('  → Job de desconexão disparado');
        }

        $this->newLine();
        $this->info('Resumo:');
        $this->table(
            ['Status', 'Quantidade'],
            [
                ['Assinaturas Ativas', $activeCount],
                ['Assinaturas Vencidas', $expiredCount],
            ]
        );

        if ($this->option('dry-run')) {
            $this->warn('Executado em modo DRY-RUN - Nenhuma alteração foi realizada');
        }

        return Command::SUCCESS;
    }
}
