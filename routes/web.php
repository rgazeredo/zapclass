<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PricingController;

// API routes for pricing
Route::get('/api/pricing/plans', [PricingController::class, 'getPlans'])->name('api.pricing.plans');

// Development route to create sample products
Route::post('/api/pricing/create-sample-products', [PricingController::class, 'createSampleProducts'])
    ->name('api.pricing.create-sample-products');

Route::get('/', function () {
    return Inertia::render('Landing/Index');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();

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

    Route::patch('settings/theme', function () {
        request()->validate([
            'theme' => 'required|in:light,dark,system',
        ]);

        auth()->user()->update([
            'theme' => request('theme'),
        ]);

        return back();
    })->name('settings.theme');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
