<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\Auth\RegisterWithPlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\WhatsAppConnectionController;
use App\Http\Controllers\WhatsAppWebhookController;
use App\Http\Controllers\WebhookController;
use App\Http\Middleware\ApiLoggerMiddleware;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

// Internal routes for pricing (frontend use only)
Route::get('/internal/pricing/plans', [PricingController::class, 'getPlans'])->name('internal.pricing.plans');
Route::get('/internal/pricing/plan/{stripe_price_id}', [PricingController::class, 'getPlan'])->name('internal.pricing.plan');

// Development route to create sample products
Route::post('/internal/pricing/create-sample-products', [PricingController::class, 'createSampleProducts'])
    ->name('internal.pricing.create-sample-products');

// WhatsApp Webhook route (public, no auth needed)
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])
    ->name('whatsapp.webhook');

// WhatsApp Webhook Proxy - recebe da UazAPI e repassa para cliente
Route::post('/webhooks/whatsapp/{webhookCode}', [\App\Http\Controllers\WhatsAppWebhookProxyController::class, 'handle'])
    ->name('whatsapp.webhook.proxy');

Route::get('/', function () {
    return Inertia::render('Landing/Index');
})->name('home');


// Test route
Route::get('/test-route', function () {
    return 'Test route works!';
});

// Registration with plan routes
Route::get('/register-with-plan', [RegisterWithPlanController::class, 'create'])
    ->name('register.with.plan');

Route::post('/register-with-plan', [RegisterWithPlanController::class, 'store'])
    ->name('register.with.plan.store');

// Subscription routes
Route::get('/subscription/success', [SubscriptionController::class, 'success'])
    ->name('subscription.success');

Route::get('/subscription/cancel/{tenant?}', [SubscriptionController::class, 'cancel'])
    ->name('subscription.cancel');

Route::post('/subscription/retry/{tenant}', [SubscriptionController::class, 'retry'])
    ->name('subscription.retry');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = User::find(Auth::user()->id);

        // Se é admin, carregar dados globais
        if ($user->isAdmin()) {
            $tenants = \App\Models\Tenant::withCount('users')
                ->orderBy('name')
                ->get()
                ->map(function ($tenant) {
                    return [
                        'id' => $tenant->id,
                        'name' => $tenant->name,
                        'slug' => $tenant->slug,
                        'users_count' => $tenant->users_count,
                        'is_active' => $tenant->is_active,
                    ];
                });

            return Inertia::render('dashboard', compact('tenants'));
        }

        // Se é client, carregar com tenant e dados do WhatsApp
        if ($user->isClient()) {
            $user->load('tenant');

            // Buscar conexões WhatsApp do tenant
            $connections = \App\Models\WhatsAppConnection::where('tenant_id', $user->tenant_id)
                ->orderBy('created_at', 'desc')
                ->get();

            $connectionsCount = $connections->count();
            $connectedCount = $connections->where('status', 'connected')->count();

            // Buscar assinaturas ativas do tenant
            $subscriptions = [];
            if ($user->tenant && method_exists($user->tenant, 'subscriptions')) {
                $subscriptions = $user->tenant->subscriptions()
                    ->active()
                    ->get()
                    ->map(function ($subscription) {
                        return [
                            'id' => $subscription->id,
                            'name' => $subscription->name,
                            'stripe_status' => $subscription->stripe_status,
                            'stripe_price' => $subscription->stripe_price,
                            'trial_ends_at' => $subscription->trial_ends_at,
                            'ends_at' => $subscription->ends_at,
                        ];
                    });
            }

            // Contar webhooks configurados
            $webhooksCount = \App\Models\Webhook::whereIn(
                'whatsapp_connection_id',
                $connections->pluck('id')
            )->count();

            return Inertia::render('dashboard', [
                'connections' => $connections,
                'connectionsCount' => $connectionsCount,
                'connectedCount' => $connectedCount,
                'subscriptions' => $subscriptions,
                'webhooksCount' => $webhooksCount,
            ]);
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    // Billing routes
    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('billing/setup-intent', [BillingController::class, 'createSetupIntent'])->name('billing.setup-intent');
    Route::post('billing/payment-method', [BillingController::class, 'addPaymentMethod'])->name('billing.payment-method.add');
    Route::put('billing/payment-method/default', [BillingController::class, 'updateDefaultPaymentMethod'])->name('billing.payment-method.default');
    Route::delete('billing/payment-method', [BillingController::class, 'removePaymentMethod'])->name('billing.payment-method.remove');
    Route::post('billing/subscription/{subscription}/cancel', [BillingController::class, 'cancelSubscription'])->name('billing.subscription.cancel');
    Route::post('billing/subscription/{subscription}/resume', [BillingController::class, 'resumeSubscription'])->name('billing.subscription.resume');
    Route::get('billing/invoice/{invoice}/download', [BillingController::class, 'downloadInvoice'])->name('billing.invoice.download');

    // WhatsApp connections routes (com logging)
    Route::middleware([ApiLoggerMiddleware::class])->group(function () {
        Route::resource('whatsapp', WhatsAppConnectionController::class);
        Route::get('whatsapp/{whatsapp}/qrcode', [WhatsAppConnectionController::class, 'qrcode'])
            ->name('whatsapp.qrcode');
        Route::post('whatsapp/{whatsapp}/disconnect', [WhatsAppConnectionController::class, 'disconnect'])
            ->name('whatsapp.disconnect');
        Route::get('whatsapp/{whatsapp}/status', [WhatsAppConnectionController::class, 'status'])
            ->name('whatsapp.status');
        Route::post('whatsapp/{whatsapp}/update-status', [WhatsAppConnectionController::class, 'updateStatus'])
            ->name('whatsapp.update-status');

        // Webhook management page
        Route::get('whatsapp/{connection}/webhooks-page', function ($connectionId) {
            $connection = \App\Models\WhatsAppConnection::where('id', $connectionId)
                ->where('tenant_id', Auth::user()->tenant_id)
                ->firstOrFail();

            return Inertia::render('WhatsApp/Webhooks/Index', [
                'connection' => $connection
            ]);
        })->name('webhooks.page');

        // Webhook management API routes
        Route::get('whatsapp/{connection}/webhooks', [WebhookController::class, 'index'])
            ->name('webhooks.index');
        Route::post('whatsapp/{connection}/webhooks', [WebhookController::class, 'store'])
            ->name('webhooks.store');
        Route::put('whatsapp/{connection}/webhooks/{webhook}', [WebhookController::class, 'update'])
            ->name('webhooks.update');
        Route::delete('whatsapp/{connection}/webhooks/{webhook}', [WebhookController::class, 'destroy'])
            ->name('webhooks.destroy');
    });

    Route::patch('settings/theme', function () {
        request()->validate([
            'theme' => 'required|in:light,dark,system',
        ]);

        $user = User::find(Auth::user()->id);
        $user->update([
            'theme' => request('theme'),
        ]);

        return back();
    })->name('settings.theme');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
