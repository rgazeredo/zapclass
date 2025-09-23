<?php

use App\Http\Controllers\Api\MessagingController;
use App\Http\Middleware\ApiAuthentication;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui são definidas as rotas da API do ZapClass para os clientes.
| Todas as rotas são protegidas pelo middleware ApiAuthentication.
|
*/

// Grupo de rotas da API v1 com middleware de autenticação
Route::prefix('v1')->middleware([ApiAuthentication::class])->group(function () {

    // Rotas de mensagens
    Route::prefix('messages')->group(function () {
        // Enviar mensagem de texto
        Route::post('send-text', [MessagingController::class, 'sendText'])
            ->name('api.messages.send-text');

        // Consultar status de mensagem
        Route::get('status/{messageId}', [MessagingController::class, 'getMessageStatus'])
            ->name('api.messages.status');
    });

    // Rotas de conexão/instância
    Route::prefix('connection')->group(function () {
        // Obter informações da conexão
        Route::get('info', [MessagingController::class, 'getConnectionInfo'])
            ->name('api.connection.info');
    });

});

// Rota de health check (sem autenticação)
Route::get('health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ZapClass API está funcionando',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
})->name('api.health');