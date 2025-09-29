<?php

use App\Http\Controllers\Api\V2\MessagingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V2 Routes
|--------------------------------------------------------------------------
|
| Rotas da API V2 do ZapClass com recursos avançados.
|
*/

// Rotas da API V2
Route::group([], function () {

    // Enviar mensagem avançada V2
    Route::post('send-advanced-message', [MessagingController::class, 'sendAdvancedMessage'])
        ->name('send-advanced-message');

});

// Health check V2
Route::get('health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ZapClass API V2 está funcionando',
        'version' => '2.0.0',
        'features' => ['templates', 'scheduling', 'multimedia'],
        'timestamp' => now()->toISOString()
    ]);
})->name('health');