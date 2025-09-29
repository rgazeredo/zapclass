<?php

use App\Http\Controllers\Api\V1\MessagingController;
use App\Http\Middleware\ApiAuthentication;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Aqui são definidas as rotas da API V1 do ZapClass para os clientes.
| Todas as rotas são protegidas pelo middleware ApiAuthentication.
|
*/

// Rotas da API V1 com middleware de autenticação
Route::middleware([ApiAuthentication::class])->group(function () {

    // Enviar mensagem de texto - localhost/api/v1/send-message
    Route::post('send-message', [MessagingController::class, 'sendText'])
        ->name('send-message');

    // Consultar status de mensagem - localhost/api/v1/message-status/{messageId}
    Route::get('message-status/{messageId}', [MessagingController::class, 'getMessageStatus'])
        ->name('message-status');

    // Obter informações da conexão - localhost/api/v1/connection-info
    Route::get('connection-info', [MessagingController::class, 'getConnectionInfo'])
        ->name('connection-info');

});

// Rota de health check V1 (sem autenticação)
Route::get('health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ZapClass API V1 está funcionando',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
})->name('health');