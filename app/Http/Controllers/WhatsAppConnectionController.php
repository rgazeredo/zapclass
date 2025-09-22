<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;

class WhatsAppConnectionController extends Controller
{
    protected $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    /**
     * Verificar e atualizar status de uma conexão
     */
    private function checkAndUpdateConnectionStatus(WhatsAppConnection $connection)
    {
        // Só verificar se a conexão tem token
        if (!$connection->token) {
            Log::info('Skipping status check for connection without token', [
                'connection_id' => $connection->id,
                'connection_name' => $connection->name
            ]);
            return;
        }

        try {
            Log::info('Checking status for connection on page load', [
                'connection_id' => $connection->id,
                'connection_name' => $connection->name,
                'current_status' => $connection->status
            ]);

            $statusData = $this->uazApiService->getInstanceStatus($connection->token);
            $newStatus = $statusData['instance']['status'] ?? 'unknown';
            $owner = $statusData['instance']['owner'] ?? null;

            Log::info('Status check result', [
                'connection_id' => $connection->id,
                'old_status' => $connection->status,
                'new_status' => $newStatus,
                'owner' => $owner,
                'api_response' => $statusData
            ]);

            // Atualizar status se mudou
            if ($connection->status !== $newStatus) {
                $updateData = ['status' => $newStatus];

                // Se conectado e tem owner, atualizar phone também
                if ($newStatus === 'connected' && !empty($owner)) {
                    $updateData['phone'] = $owner;
                }

                $connection->update($updateData);

                Log::info('Connection status updated on page load', [
                    'connection_id' => $connection->id,
                    'connection_name' => $connection->name,
                    'old_status' => $connection->getOriginal('status'),
                    'new_status' => $newStatus,
                    'phone' => $owner
                ]);
            }

        } catch (Exception $e) {
            Log::error('Failed to check connection status on page load', [
                'connection_id' => $connection->id,
                'connection_name' => $connection->name,
                'token' => $connection->token,
                'error' => $e->getMessage()
            ]);
        }
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

        // Verificar status de cada conexão na API e atualizar no banco
        foreach ($connections as $connection) {
            $this->checkAndUpdateConnectionStatus($connection);
        }

        // Recarregar as conexões para pegar os status atualizados
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
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            // Criar conexão no banco de dados
            $connection = WhatsAppConnection::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'system_name' => 'ZapClass',
                'admin_field_1' => $request->admin_field_1,
                'admin_field_2' => $request->admin_field_2,
                'status' => 'creating',
            ]);

            // Criar instância na API UAZ
            $apiResponse = $this->uazApiService->createInstance([
                'name' => $connection->name,
                'system_name' => 'ZapClass',
                'admin_field_1' => $connection->admin_field_1,
                'admin_field_2' => $connection->admin_field_2,
            ]);

            Log::debug('apiResponse', $apiResponse);

            // Atualizar conexão com dados da API
            $connection->update([
                'status' => 'created',
                'token' => $apiResponse['instance']['token'] ?? null,
                'instance_id' => $apiResponse['instance']['id'] ?? null,
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
                    Log::warning('Failed to cleanup UAZ instance after error', [
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
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
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
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
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
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            Log::info('WhatsApp Connection Updated', [
                'connection_id' => $whatsapp->id,
                'name1' => $request->name,
                'name2' => $whatsapp->name,
                'admin_field_11' => $whatsapp->admin_field_1,
                'admin_field_12' => $request->admin_field_1,
                'admin_field_21' => $whatsapp->admin_field_2,
                'admin_field_22' => $request->admin_field_2,
            ]);

            if ($whatsapp->name !== $request->name) {
                // Atualiza o nome da instância na API UAZ
                $this->uazApiService->updateInstance($whatsapp->token, $request->name);
            }

            if ($whatsapp->admin_field_1 !== $request->admin_field_1 || $whatsapp->admin_field_2 !== $request->admin_field_2) {
                // Atualiza os campos admin_field_1 e admin_field_2 na instância na API UAZ
                $this->uazApiService->updateAdminFields($whatsapp->instance_id, $request->admin_field_1, $request->admin_field_2);
            }

            $whatsapp->update([
                'name' => $request->name,
                'system_name' => 'ZapClass',
                'admin_field_1' => $request->admin_field_1,
                'admin_field_2' => $request->admin_field_2,
            ]);

            DB::commit();

            return redirect()->route('whatsapp.index')
                ->with('success', 'WhatsApp connection updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();

            $this->uazApiService->updateInstance($whatsapp->token, $whatsapp->name);
            $this->uazApiService->updateAdminFields($whatsapp->instance_id, $whatsapp->admin_field_1, $whatsapp->admin_field_2);

            return redirect()->route('whatsapp.index')
                ->with('error', 'Failed to update WhatsApp connection: ' . $e->getMessage());
        }
    }

    /**
     * Disconnect WhatsApp instance
     */
    public function disconnect(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Verificar se a conexão tem token
        if (!$whatsapp->token) {
            return response()->json([
                'success' => false,
                'message' => 'Token da instância não encontrado.'
            ], 400);
        }

        try {
            // Desconectar na API UAZ
            $this->uazApiService->disconnectInstance($whatsapp->token);

            // Atualizar status no banco
            $whatsapp->update([
                'status' => 'disconnected',
                'phone' => null
            ]);

            Log::info('WhatsApp instance disconnected', [
                'connection_id' => $whatsapp->id,
                'connection_name' => $whatsapp->name
            ]);

            // Gerar novo QR code
            $qrData = $this->uazApiService->getQrCode($whatsapp->token);

            return response()->json([
                'success' => true,
                'message' => 'Instância desconectada com sucesso.',
                'qrcode' => $qrData
            ]);
        } catch (Exception $e) {
            Log::error('Failed to disconnect WhatsApp instance', [
                'connection_id' => $whatsapp->id,
                'token' => $whatsapp->token,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to disconnect instance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for WhatsApp connection
     */
    public function qrcode(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Verificar se a conexão tem token
        if (!$whatsapp->token) {
            return response()->json([
                'success' => false,
                'message' => 'Token da instância não encontrado. A conexão precisa ser recriada.'
            ], 400);
        }

        try {
            $qrData = $this->uazApiService->getQrCode($whatsapp->token);

            return response()->json([
                'success' => true,
                'qrcode' => $qrData
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get instance status from UAZ API
     */
    public function status(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Verificar se a conexão tem token
        if (!$whatsapp->token) {
            return response()->json([
                'success' => false,
                'message' => 'Token da instância não encontrado.'
            ], 400);
        }

        try {
            $statusData = $this->uazApiService->getInstanceStatus($whatsapp->token);

            if ($statusData['instance']['status'] == 'connected' && !empty($statusData['instance']['owner'])) {
                $whatsapp->update([
                    'status' => $statusData['instance']['status'],
                    'phone' => $statusData['instance']['owner'],
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => $statusData['instance']['status'] ?? 'unknown',
                'data' => $statusData
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get instance status', [
                'connection_id' => $whatsapp->id,
                'token' => $whatsapp->token,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get instance status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update connection status
     */
    public function updateStatus(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|string|in:creating,created,connecting,connected,disconnected,error'
        ]);

        try {
            $whatsapp->update([
                'status' => $request->status
            ]);

            Log::info('WhatsApp connection status updated', [
                'connection_id' => $whatsapp->id,
                'old_status' => $whatsapp->getOriginal('status'),
                'new_status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to update connection status', [
                'connection_id' => $whatsapp->id,
                'status' => $request->status,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== Auth::user()->tenant_id) {
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
            Log::warning('Failed to delete UAZ instance, deleting from database anyway', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);

            $whatsapp->delete();

            return redirect()->route('whatsapp.index')
                ->with('warning', 'WhatsApp connection deleted, but there was an issue with the external API.');
        }
    }
}
