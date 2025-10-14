<?php

use App\Http\Controllers\Api\V1\MessageController as V1MessageController;
use App\Http\Controllers\Api\V1\ContactController as V1ContactController;
use App\Http\Controllers\Api\V1\LabelController as V1LabelController;
use App\Http\Controllers\Api\V1\GroupController as V1GroupController;
use App\Http\Controllers\Api\V1\CommunityController as V1CommunityController;
use App\Http\Controllers\Api\V1\QuickreplyController as V1QuickreplyController;
use App\Http\Controllers\Api\V1\CampaignController as V1CampaignController;
use App\Http\Controllers\Api\V1\ProfileController as V1ProfileController;
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

        Route::post('update-description', [V1GroupController::class, 'updateDescription'])
            ->name('api.groups.update-description');

        Route::post('update-image', [V1GroupController::class, 'updateImage'])
            ->name('api.groups.update-image');

        Route::post('update-locked', [V1GroupController::class, 'updateLocked'])
            ->name('api.groups.update-locked');

        Route::post('update-announce', [V1GroupController::class, 'updateAnnounce'])
            ->name('api.groups.update-announce');

        Route::get('invite-link', [V1GroupController::class, 'inviteLink'])
            ->name('api.groups.invite-link');

        Route::post('invite-info', [V1GroupController::class, 'inviteInfo'])
            ->name('api.groups.invite-info');

        Route::post('reset-invite', [V1GroupController::class, 'resetInvite'])
            ->name('api.groups.reset-invite');

        Route::post('join', [V1GroupController::class, 'join'])
            ->name('api.groups.join');

        Route::post('leave', [V1GroupController::class, 'leave'])
            ->name('api.groups.leave');

    });


    Route::prefix('communities')->group(function () {
      
        Route::post('create', [V1CommunityController::class, 'create'])
            ->name('api.communities.create');

        Route::post('edit-groups', [V1CommunityController::class, 'editGroups'])
            ->name('api.communities.edit-groups');


    });

    Route::prefix('quick-replies')->group(function () {
      
        Route::post('create', [V1QuickreplyController::class, 'create'])
            ->name('api.quick-replies.create');

        Route::get('list', [V1QuickreplyController::class, 'list'])
            ->name('api.quick-replies.list');

        Route::post('edit', [V1QuickreplyController::class, 'edit'])
            ->name('api.quick-replies.edit');

        Route::post('delete', [V1QuickreplyController::class, 'delete'])
            ->name('api.quick-replies.delete');


    });

    Route::prefix('campaigns')->group(function () {
      
        Route::post('create-simple', [V1CampaignController::class, 'createSimple'])
            ->name('api.campaigns.create-simple');
            
        Route::post('create-advanced', [V1CampaignController::class, 'createAdvanced'])
            ->name('api.campaigns.create-advanced');

        Route::get('list-folders', [V1CampaignController::class, 'listFolders'])
            ->name('api.campaigns.list-folders');

        Route::post('list-messages', [V1CampaignController::class, 'listMessages'])
            ->name('api.campaigns.list-messages');

        Route::post('control', [V1CampaignController::class, 'control'])
            ->name('api.campaigns.control');

        Route::post('cleanup', [V1CampaignController::class, 'cleanup'])
            ->name('api.campaigns.cleanup');

        Route::delete('clear-all', [V1CampaignController::class, 'clearAll'])
            ->name('api.campaigns.clear-all');


    });

    Route::prefix('profile')->group(function () {
      
        Route::post('update-name', [V1ProfileController::class, 'updateName'])
            ->name('api.profile.update-name');
            
        Route::post('update-image', [V1ProfileController::class, 'updateImage'])
            ->name('api.profile.update-image');
            
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
