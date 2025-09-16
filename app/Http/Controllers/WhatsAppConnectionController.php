<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class WhatsAppConnectionController extends Controller
{
    protected $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenant = Auth::user()->tenant;
        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $maxConnections = $tenant->whatsapp_connections;
        $currentConnections = $connections->count();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenant = Auth::user()->tenant;
        $currentConnections = WhatsAppConnection::where('tenant_id', $tenant->id)->count();
        $maxConnections = $tenant->whatsapp_connections;

        if ($currentConnections >= $maxConnections) {
            return redirect()->route('whatsapp.index')
                ->with('error', 'You have reached the maximum number of WhatsApp connections for your plan.');
        }

        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
            'modalType' => 'create',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = Auth::user()->tenant;
        $currentConnections = WhatsAppConnection::where('tenant_id', $tenant->id)->count();
        $maxConnections = $tenant->whatsapp_connections;

        if ($currentConnections >= $maxConnections) {
            return redirect()->route('whatsapp.index')
                ->with('error', 'You have reached the maximum number of WhatsApp connections for your plan.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'system_name' => 'required|string|max:255',
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            // Criar conexão no banco de dados
            $connection = WhatsAppConnection::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'system_name' => $request->system_name,
                'admin_field_1' => $request->admin_field_1,
                'admin_field_2' => $request->admin_field_2,
                'status' => 'creating',
            ]);

            // Criar instância na API UAZ
            $instanceName = $connection->instance_name;
            $apiResponse = $this->uazApiService->createInstance($instanceName, [
                'name' => $connection->name,
                'admin_field_1' => $connection->admin_field_1,
                'admin_field_2' => $connection->admin_field_2,
            ]);

            // Atualizar conexão com dados da API
            $connection->update([
                'status' => 'created',
                'phone' => $apiResponse['phone'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('whatsapp.index')
                ->with('success', 'WhatsApp connection created successfully.');

        } catch (Exception $e) {
            DB::rollBack();

            // Se houve erro, tentar deletar a instância criada na API (se existir)
            if (isset($instanceName)) {
                try {
                    $this->uazApiService->deleteInstance($instanceName);
                } catch (Exception $deleteException) {
                    // Log do erro de delete, mas não falhar por isso
                    \Log::warning('Failed to cleanup UAZ instance after error', [
                        'instance' => $instanceName,
                        'error' => $deleteException->getMessage()
                    ]);
                }
            }

            return redirect()->route('whatsapp.index')
                ->with('error', 'Failed to create WhatsApp connection: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('WhatsApp/Show', [
            'connection' => $whatsapp,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $tenant = Auth::user()->tenant;
        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $maxConnections = $tenant->whatsapp_connections;
        $currentConnections = $connections->count();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
            'modalType' => 'edit',
            'editConnection' => $whatsapp,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'system_name' => 'required|string|max:255',
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        $whatsapp->update([
            'name' => $request->name,
            'system_name' => $request->system_name,
            'admin_field_1' => $request->admin_field_1,
            'admin_field_2' => $request->admin_field_2,
        ]);

        return redirect()->route('whatsapp.index')
            ->with('success', 'WhatsApp connection updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $instanceName = $whatsapp->instance_name;

        DB::beginTransaction();

        try {
            // Deletar instância na API UAZ primeiro
            $this->uazApiService->deleteInstance($instanceName);

            // Deletar conexão do banco de dados
            $whatsapp->delete();

            DB::commit();

            return redirect()->route('whatsapp.index')
                ->with('success', 'WhatsApp connection deleted successfully.');

        } catch (Exception $e) {
            DB::rollBack();

            // Se falhou ao deletar na API, ainda assim deletar do banco
            // pois a instância pode não existir mais na API
            \Log::warning('Failed to delete UAZ instance, deleting from database anyway', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);

            $whatsapp->delete();

            return redirect()->route('whatsapp.index')
                ->with('warning', 'WhatsApp connection deleted, but there was an issue with the external API.');
        }
    }
}
