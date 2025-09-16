<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Price;
use Stripe\Product;

class PricingController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('cashier.secret'));
    }

    /**
     * Get pricing plans from Stripe
     */
    public function getPlans()
    {
        try {
            // Buscar todos os preços ativos
            $prices = Price::all([
                'active' => true,
                'expand' => ['data.product'],
                'limit' => 100
            ]);

            $plans = [];

            foreach ($prices->data as $price) {
                $product = $price->product;

                // Pular se não for produto ativo
                if (!$product->active) {
                    continue;
                }

                // Filtrar apenas planos principais (não addons)
                if (isset($product->metadata['role']) && $product->metadata['role'] !== 'plan') {
                    continue;
                }

                // Converter centavos para reais
                $amount = $price->unit_amount / 100;

                // Determinar o tipo de plano baseado no nome ou metadata
                $planType = $this->determinePlanType($product->name, $product->metadata ?? []);

                $plans[] = [
                    'id' => $price->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description ?? '',
                    'price' => $amount,
                    'currency' => strtoupper($price->currency),
                    'interval' => $price->recurring->interval ?? 'month',
                    'interval_count' => $price->recurring->interval_count ?? 1,
                    'type' => $planType,
                    'features' => $this->getPlanFeatures($planType, $product->metadata ?? []),
                    'popular' => $planType === 'professional', // Marcar profissional como popular
                    'stripe_price_id' => $price->id,
                    'metadata' => $product->metadata ?? []
                ];
            }

            // Ordenar planos por preço
            usort($plans, function($a, $b) {
                return $a['price'] <=> $b['price'];
            });

            return response()->json($plans);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar planos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determinar o tipo de plano baseado no nome ou metadata
     */
    private function determinePlanType($name, $metadata)
    {
        $name = strtolower($name);

        if (isset($metadata['plan_type'])) {
            return $metadata['plan_type'];
        }

        if (str_contains($name, 'básico') || str_contains($name, 'basic')) {
            return 'basic';
        }

        if (str_contains($name, 'profissional') || str_contains($name, 'professional') || str_contains($name, 'pro')) {
            return 'professional';
        }

        if (str_contains($name, 'empresarial') || str_contains($name, 'enterprise') || str_contains($name, 'business')) {
            return 'enterprise';
        }

        return 'basic'; // Default
    }

    /**
     * Obter features do plano baseado no tipo
     */
    private function getPlanFeatures($type, $metadata)
    {
        // Se as features estão definidas no metadata do Stripe
        if (isset($metadata['features'])) {
            return json_decode($metadata['features'], true);
        }

        // Features padrão baseadas no tipo
        switch ($type) {
            case 'basic':
                return [
                    '1 Conexão WhatsApp',
                    '1.000 mensagens/mês',
                    'Dashboard básico',
                    'Suporte por email'
                ];

            case 'professional':
                return [
                    '3 Conexões WhatsApp',
                    '5.000 mensagens/mês',
                    'Dashboard avançado',
                    'API acesso completo',
                    'Suporte prioritário'
                ];

            case 'enterprise':
                return [
                    'Conexões ilimitadas',
                    '25.000 mensagens/mês',
                    'Dashboard empresarial',
                    'API completa + Webhooks',
                    'Cursos exclusivos',
                    'Suporte 24/7'
                ];

            default:
                return [];
        }
    }

    /**
     * Criar produtos de exemplo no Stripe (para desenvolvimento)
     */
    public function createSampleProducts()
    {
        if (app()->environment('production')) {
            return response()->json(['error' => 'Não é possível criar produtos em produção'], 403);
        }

        try {
            $products = [
                [
                    'name' => 'Plano Básico',
                    'description' => 'Ideal para pequenos negócios',
                    'price' => 2990, // R$ 29,90 em centavos
                    'type' => 'basic'
                ],
                [
                    'name' => 'Plano Profissional',
                    'description' => 'Para empresas em crescimento',
                    'price' => 5990, // R$ 59,90 em centavos
                    'type' => 'professional'
                ],
                [
                    'name' => 'Plano Empresarial',
                    'description' => 'Para grandes volumes',
                    'price' => 14990, // R$ 149,90 em centavos
                    'type' => 'enterprise'
                ]
            ];

            $createdProducts = [];

            foreach ($products as $productData) {
                // Criar produto
                $product = Product::create([
                    'name' => $productData['name'],
                    'description' => $productData['description'],
                    'metadata' => [
                        'plan_type' => $productData['type']
                    ]
                ]);

                // Criar preço
                $price = Price::create([
                    'unit_amount' => $productData['price'],
                    'currency' => 'brl',
                    'recurring' => [
                        'interval' => 'month',
                    ],
                    'product' => $product->id,
                ]);

                $createdProducts[] = [
                    'product' => $product,
                    'price' => $price
                ];
            }

            return response()->json([
                'message' => 'Produtos criados com sucesso',
                'products' => $createdProducts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao criar produtos: ' . $e->getMessage()
            ], 500);
        }
    }
}