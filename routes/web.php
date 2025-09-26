<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\Auth\RegisterWithPlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WhatsAppConnectionController;
use App\Http\Controllers\WhatsAppWebhookController;
use App\Http\Controllers\WebhookController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

// API routes for pricing
Route::get('/api/pricing/plans', [PricingController::class, 'getPlans'])->name('api.pricing.plans');
Route::get('/api/pricing/plan/{stripe_price_id}', [PricingController::class, 'getPlan'])->name('api.pricing.plan');

// Development route to create sample products
Route::post('/api/pricing/create-sample-products', [PricingController::class, 'createSampleProducts'])
    ->name('api.pricing.create-sample-products');

// WhatsApp Webhook route (public, no auth needed)
Route::post('/api/whatsapp/webhook', [WhatsAppWebhookController::class, 'handle'])
    ->name('whatsapp.webhook');

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

        // Se é client, carregar com tenant
        if ($user->isClient()) {
            $user->load('tenant');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    // WhatsApp connections routes
    Route::resource('whatsapp', WhatsAppConnectionController::class);
    Route::get('whatsapp/{whatsapp}/qrcode', [WhatsAppConnectionController::class, 'qrcode'])
        ->name('whatsapp.qrcode');
    Route::post('whatsapp/{whatsapp}/disconnect', [WhatsAppConnectionController::class, 'disconnect'])
        ->name('whatsapp.disconnect');
    Route::get('whatsapp/{whatsapp}/status', [WhatsAppConnectionController::class, 'status'])
        ->name('whatsapp.status');
    Route::post('whatsapp/{whatsapp}/update-status', [WhatsAppConnectionController::class, 'updateStatus'])
        ->name('whatsapp.update-status');

    // Webhook management routes
    Route::get('whatsapp/{connection}/webhooks', [WebhookController::class, 'index'])
        ->name('webhooks.index');
    Route::post('whatsapp/{connection}/webhooks', [WebhookController::class, 'store'])
        ->name('webhooks.store');
    Route::put('whatsapp/{connection}/webhooks/{webhook}', [WebhookController::class, 'update'])
        ->name('webhooks.update');
    Route::delete('whatsapp/{connection}/webhooks/{webhook}', [WebhookController::class, 'destroy'])
        ->name('webhooks.destroy');

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
