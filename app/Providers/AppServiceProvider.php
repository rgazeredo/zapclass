<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->isProduction()) {
            ($this->{'app'}['request'] ?? null)?->server?->set('HTTPS', 'on');
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Desabilita as rotas padrão do Scramble
        // Scramble::ignoreDefaultRoutes();

        // Scramble::registerApi('v1', [
        //     'api_path' => 'api/v1',
        // ])->expose(
        //     ui: '/docs/api/v1',
        //     document: '/docs/api/v1.json'
        // );

        // Scramble::registerApi('v2', [
        //     'api_path' => 'api/v2',
        // ])->expose(
        //     ui: '/docs/api/v2',
        //     document: '/docs/api/v2.json'
        // );

        // Rota padrão que redireciona para a versão mais recente
        // Scramble::registerApi('default', [
        //     'api_path' => 'api/v1', // Aponta para a versão mais recente
        // ])->expose(
        //     ui: '/docs/api',
        //     document: '/docs/api.json'
        // );
    }
}
