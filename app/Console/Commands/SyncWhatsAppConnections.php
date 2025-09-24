<?php

namespace App\Console\Commands;

use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Illuminate\Console\Command;

class SyncWhatsAppConnections extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:sync {--tenant= : Sync only specific tenant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync WhatsApp connections status with API';

    protected $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        parent::__construct();
        $this->uazApiService = $uazApiService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting WhatsApp connections sync...');

        $query = WhatsAppConnection::with('tenant');

        if ($tenantSlug = $this->option('tenant')) {
            $query->whereHas('tenant', function ($q) use ($tenantSlug) {
                $q->where('slug', $tenantSlug);
            });
            $this->info("Syncing connections for tenant: {$tenantSlug}");
        }

        $connections = $query->get();
        $this->info("Found {$connections->count()} connections to sync");

        $bar = $this->output->createProgressBar($connections->count());
        $bar->start();

        $synced = 0;
        $errors = 0;

        foreach ($connections as $connection) {
            try {
                $status = $this->uazApiService->getInstanceStatus($connection->instance_name);

                $currentStatus = $connection->status;
                $newStatus = $this->mapApiStatusToLocal($status);

                if ($currentStatus !== $newStatus) {
                    $connection->update([
                        'status' => $newStatus,
                        'phone' => $status['phone'] ?? $connection->phone,
                    ]);

                    $this->line("\n[{$connection->instance_name}] Status updated: {$currentStatus} -> {$newStatus}");
                    $synced++;
                }
            } catch (\Exception $e) {
                $this->error("\n[{$connection->instance_name}] Error: " . $e->getMessage());
                $errors++;
            }

            $bar->advance();
        }

        $bar->finish();

        $this->newLine(2);
        $this->info("Sync completed!");
        $this->info("Updated: {$synced}");
        $this->info("Errors: {$errors}");
        $this->info("Total processed: {$connections->count()}");
    }

    /**
     * Map API status to local status
     */
    private function mapApiStatusToLocal(array $apiStatus): string
    {
        $status = $apiStatus['status'] ?? 'unknown';

        switch (strtolower($status)) {
            case 'connected':
            case 'online':
                return 'connected';
            case 'disconnected':
            case 'offline':
                return 'disconnected';
            case 'connecting':
            case 'pending':
                return 'connecting';
            case 'error':
            case 'failed':
                return 'error';
            default:
                return 'disconnected';
        }
    }
}
