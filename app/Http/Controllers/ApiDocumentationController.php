<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiDocumentationController extends Controller
{
    /**
     * Display the API documentation overview page
     */
    public function index(): Response
    {
        return Inertia::render('ApiDocumentation/Index', [
            'baseUrl' => config('app.url'),
            'apiPrefix' => 'api/zapclass',
        ]);
    }

    /**
     * Display the send message endpoint documentation
     */
    public function sendMessage(): Response
    {
        return Inertia::render('ApiDocumentation/SendMessage', [
            'baseUrl' => config('app.url'),
            'apiPrefix' => 'api/zapclass',
        ]);
    }

    /**
     * Display the message status endpoint documentation
     */
    public function messageStatus(): Response
    {
        return Inertia::render('ApiDocumentation/MessageStatus', [
            'baseUrl' => config('app.url'),
            'apiPrefix' => 'api/zapclass',
        ]);
    }

    /**
     * Display the connection info endpoint documentation
     */
    public function connectionInfo(): Response
    {
        return Inertia::render('ApiDocumentation/ConnectionInfo', [
            'baseUrl' => config('app.url'),
            'apiPrefix' => 'api/zapclass',
        ]);
    }
}