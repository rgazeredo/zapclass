<?php

use App\Http\Controllers\Api\V1\MessageController as V1MessageController;
use App\Http\Controllers\Api\V1\ContactController as V1ContactController;
use App\Http\Controllers\Api\V1\LabelController as V1LabelController;
use App\Http\Controllers\Api\V1\GroupController as V1GroupController;
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
        Route::post('text', [V1MessageController::class, 'text'])
            ->name('api.messages.text');
        
        Route::post('media', [V1MessageController::class, 'media'])
            ->name('api.messages.media');

        Route::post('contact', [V1MessageController::class, 'contact'])
            ->name('api.messages.contact');

        Route::post('location', [V1MessageController::class, 'location'])
            ->name('api.messages.location');

        Route::post('status', [V1MessageController::class, 'status'])
            ->name('api.messages.status');

        Route::post('menu-buttons', [V1MessageController::class, 'menuButtons'])
            ->name('api.messages.menu-buttons');

        Route::post('menu-lists', [V1MessageController::class, 'menuLists'])
            ->name('api.messages.menu-lists');

        Route::post('menu-polls', [V1MessageController::class, 'menuPolls'])
            ->name('api.messages.menu-polls');

        Route::post('menu-carousel', [V1MessageController::class, 'menuCarousel'])
            ->name('api.messages.menu-carousel');

        Route::post('react', [V1MessageController::class, 'react'])
            ->name('api.messages.react');

        Route::post('edit', [V1MessageController::class, 'edit'])
            ->name('api.messages.edit');

        Route::post('delete', [V1MessageController::class, 'delete'])
            ->name('api.messages.delete');
            
        Route::post('download', [V1MessageController::class, 'download'])
            ->name('api.messages.download');

        Route::post('find', [V1MessageController::class, 'find'])
            ->name('api.messages.find');

        Route::post('mark-read', [V1MessageController::class, 'markRead'])
            ->name('api.messages.mark-read');
            

        // Consultar status de mensagem
        // Route::get('status/{messageId}', [MessagingController::class, 'getMessageStatus'])
        //     ->name('api.messages.status');
    });
        
    Route::prefix('contacts')->group(function () {
      
        Route::post('add', [V1ContactController::class, 'add'])
            ->name('api.contacts.add');

        Route::get('contacts', [V1ContactController::class, 'get'])
            ->name('api.contacts.get');

        Route::post('details', [V1ContactController::class, 'details'])
            ->name('api.contacts.details');

        Route::post('remove', [V1ContactController::class, 'remove'])
            ->name('api.contacts.remove');

        Route::post('block', [V1ContactController::class, 'block'])
            ->name('api.contacts.block');

        Route::get('blocklist', [V1ContactController::class, 'blocklist'])
            ->name('api.contacts.blocklist');



    });

    Route::prefix('labels')->group(function () {
      
        Route::post('manage', [V1LabelController::class, 'manage'])
            ->name('api.labels.manage');

        Route::get('list', [V1LabelController::class, 'list'])
            ->name('api.labels.list');

        Route::post('edit', [V1LabelController::class, 'edit'])
            ->name('api.labels.edit');

    });
        
    Route::prefix('groups')->group(function () {
      
        Route::post('create', [V1GroupController::class, 'create'])
            ->name('api.groups.create');

        Route::get('list', [V1GroupController::class, 'list'])
            ->name('api.groups.list');

        Route::post('info', [V1GroupController::class, 'info'])
            ->name('api.groups.info');
            
        Route::post('update-participants', [V1GroupController::class, 'updateParticipants'])
            ->name('api.groups.update-participants');
            
        Route::post('update-name', [V1GroupController::class, 'updateName'])
            ->name('api.groups.update-name');

    });

    // Rotas de conexão/instância
    // Route::prefix('connection')->group(function () {
    //     // Obter informações da conexão
    //     Route::get('info', [MessagingController::class, 'getConnectionInfo'])
    //         ->name('api.connection.info');
    // });
});

// Route::prefix('v2')->middleware([ApiAuthentication::class])->group(function () {

//     // Rotas de mensagens
//     Route::prefix('messages')->group(function () {
//         // Enviar mensagem avançada V2
//         Route::post('send-advanced-message', [V2MessagingController::class, 'sendAdvancedMessage'])
//             ->name('api.messages.send-advanced-message');
//     });

//     Route::prefix('connection')->group(function () {
//         // Obter informações da conexão
//         Route::get('info', [MessagingController::class, 'getConnectionInfo'])
//             ->name('api.connection.info');
//     });
// });

// Rota de health check (sem autenticação)
Route::get('health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ZapClass API está funcionando',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
})->name('api.health');
