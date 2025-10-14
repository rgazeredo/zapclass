<?php

namespace Database\Seeders;

use App\Models\UazApiAccount;
use App\Models\WhatsAppConnection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UazApiAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Credenciais atuais do UazApiService.php
        $baseUrl = 'https://w4digital.uazapi.com';
        $adminToken = 'X6qJRwJZ9UGQcvIcw5bvFrojp52YCtabXZBg2P4hajIJq97a30';

        // Verifica se já existe uma conta com essas credenciais
        $existingAccount = UazApiAccount::where('base_url', $baseUrl)->first();

        if ($existingAccount) {
            $this->command->info('Conta UazAPI já existe (ID: ' . $existingAccount->id . ')');
            $account = $existingAccount;
        } else {
            // Criar conta principal com credenciais atuais
            $account = UazApiAccount::create([
                'name' => 'Plano Principal W4Digital',
                'base_url' => $baseUrl,
                'admin_token' => $adminToken, // Será criptografado automaticamente pelo mutator
                'max_connections' => 300,
                'current_connections' => 4,
                'is_active' => true,
                'notes' => 'Conta migrada automaticamente das credenciais hardcoded',
            ]);

            $this->command->info('Conta UazAPI criada com sucesso (ID: ' . $account->id . ')');
        }

        // Contar conexões existentes sem conta vinculada
        $connectionsWithoutAccount = WhatsAppConnection::whereNull('uaz_api_account_id')->count();

        if ($connectionsWithoutAccount > 0) {
            $this->command->info("Vinculando {$connectionsWithoutAccount} conexões existentes à conta...");

            // Atualizar todas as conexões existentes para usar essa conta
            WhatsAppConnection::whereNull('uaz_api_account_id')
                ->update(['uaz_api_account_id' => $account->id]);

            // Atualizar contador de conexões
            $totalConnections = WhatsAppConnection::where('uaz_api_account_id', $account->id)->count();
            $account->update(['current_connections' => $totalConnections]);

            $this->command->info("Contador atualizado: {$totalConnections} conexões");
        } else {
            $this->command->info('Todas as conexões já estão vinculadas');
        }

        $this->command->info('✓ Migração concluída com sucesso!');
        $this->command->info("  - Conta: {$account->name}");
        $this->command->info("  - Conexões: {$account->current_connections}/{$account->max_connections}");
        $this->command->info("  - Slots disponíveis: {$account->availableSlots()}");
    }
}
