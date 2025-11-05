<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TicketCategory;

class TicketCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Suporte Técnico',
                'slug' => 'suporte-tecnico',
                'description' => 'Problemas técnicos e dúvidas sobre o uso da plataforma',
                'color' => '#3b82f6',
                'order' => 1,
            ],
            [
                'name' => 'Conexão WhatsApp',
                'slug' => 'conexao-whatsapp',
                'description' => 'Problemas com conexões e QR codes do WhatsApp',
                'color' => '#10b981',
                'order' => 2,
            ],
            [
                'name' => 'Faturamento',
                'slug' => 'faturamento',
                'description' => 'Dúvidas sobre planos, pagamentos e faturas',
                'color' => '#f59e0b',
                'order' => 3,
            ],
            [
                'name' => 'API e Integrações',
                'slug' => 'api-integracoes',
                'description' => 'Questões sobre API, webhooks e integrações',
                'color' => '#8b5cf6',
                'order' => 4,
            ],
            [
                'name' => 'Recursos e Funcionalidades',
                'slug' => 'recursos-funcionalidades',
                'description' => 'Sugestões de melhorias e novos recursos',
                'color' => '#ec4899',
                'order' => 5,
            ],
            [
                'name' => 'Outros',
                'slug' => 'outros',
                'description' => 'Outros assuntos não categorizados',
                'color' => '#6b7280',
                'order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            TicketCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
