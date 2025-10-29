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

            // Criar instância na API (retorna ['data' => resposta, 'account' => UazApiAccount])
            $apiResponse = $this->uazApiService->createInstance([
                'name' => $connection->name,
                'system_name' => 'ZapClass',
                'admin_field_1' => $connection->admin_field_1,
                'admin_field_2' => $connection->admin_field_2,
            ]);

            // Atualizar conexão com dados da API e vincular à conta
            $connection->update([
                'status' => 'created',
                'token' => $apiResponse['data']['instance']['token'] ?? null,
                'instance_id' => $apiResponse['data']['instance']['id'] ?? null,
                'uaz_api_account_id' => $apiResponse['account']->id,
            ]);

            // Incrementar contador de conexões da conta
            $apiResponse['account']->incrementConnections();

            $connection->enableApi();

            DB::commit();

            return redirect()->route('whatsapp.index')
                ->with('success', 'WhatsApp connection created successfully.');
        } catch (Exception $e) {
            Log::error('Failed to create WhatsApp connection', [
                'error_message' => $e->getMessage(),
                'user_id' => Auth::id(),
                'tenant_id' => $tenant->id,
            ]);

            DB::rollBack();

            // Se houve erro, tentar deletar a instância criada na API (se existir)
            if (isset($connection) && isset($connection->token)) {
                try {
                    $this->uazApiService->deleteInstance($connection->token);
                } catch (Exception $deleteException) {
                    // Log do erro de delete, mas não falhar por isso
                    Log::warning('Failed to delete instance after error', [
                        'token' => $connection->token,
                        'error' => $deleteException->getMessage()
                    ]);
                }
            }

            // Mensagem amigável para o usuário
            return redirect()->route('whatsapp.index')
                ->with('error', 'The server is experiencing temporary instability. Please try again later.');
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
            if ($whatsapp->name !== $request->name) {
                // Atualiza o nome da instância na API
                $this->uazApiService->updateInstance($whatsapp, $request->name);
            }

            if ($whatsapp->admin_field_1 !== $request->admin_field_1 || $whatsapp->admin_field_2 !== $request->admin_field_2) {
                // Atualiza os campos admin_field_1 e admin_field_2 na instância na API
                $this->uazApiService->updateAdminFields($whatsapp, $whatsapp->instance_id, $request->admin_field_1, $request->admin_field_2);
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

            // Reverter alterações na API em caso de erro
            try {
                $this->uazApiService->updateInstance($whatsapp, $whatsapp->name);
                $this->uazApiService->updateAdminFields($whatsapp, $whatsapp->instance_id, $whatsapp->admin_field_1, $whatsapp->admin_field_2);
            } catch (Exception $revertException) {
                Log::warning('Failed to revert changes on API', [
                    'connection_id' => $whatsapp->id,
                    'error' => $revertException->getMessage()
                ]);
            }

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
            // Desconectar na API
            $this->uazApiService->disconnectInstance($whatsapp->token);

            // Atualizar status no banco
            $whatsapp->update([
                'status' => 'disconnected',
                'phone' => null
            ]);

            // Tentar gerar novo QR code com retry logic
            $maxAttempts = 3;
            $attempt = 0;
            $qrData = null;

            while ($attempt < $maxAttempts) {
                $attempt++;

                try {
                    // Aguardar um pouco antes de pedir o QR code
                    if ($attempt > 1) {
                        sleep($attempt * 2);
                    }

                    $qrData = $this->uazApiService->getQrCode($whatsapp->token);

                    // Verificar se o QR code foi gerado
                    if (!empty($qrData['instance']['qrcode'])) {
                        break;
                    }
                } catch (Exception $e) {
                    // Ignorar erros ao tentar obter QR code
                }
            }

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
            // Tentar gerar QR code com retry logic
            $maxAttempts = 5;
            $attempt = 0;
            $qrData = null;
            $lastError = null;

            while ($attempt < $maxAttempts) {
                $attempt++;

                try {
                    $qrData = $this->uazApiService->getQrCode($whatsapp->token);

                    // Verificar se o QR code foi gerado
                    if (!empty($qrData['instance']['qrcode'])) {
                        return response()->json([
                            'success' => true,
                            'qrcode' => $qrData
                        ]);
                    }

                    // Se não tem QR code mas a instância está "connecting", aguardar
                    if ($qrData['instance']['status'] === 'connecting') {
                        $lastError = 'Instance is still initializing, waiting...';

                        // Aguardar progressivamente: 2s, 4s, 6s, 8s, 10s
                        if ($attempt < $maxAttempts) {
                            sleep($attempt * 2);
                            continue;
                        }
                    }

                    // Se chegou aqui, algo está errado
                    $lastError = 'QR code not generated. Instance status: ' . ($qrData['instance']['status'] ?? 'unknown');
                    break;

                } catch (Exception $e) {
                    $lastError = $e->getMessage();

                    // Aguardar antes de tentar novamente
                    if ($attempt < $maxAttempts) {
                        sleep($attempt * 2);
                    }
                }
            }

            // Se chegou aqui, todas as tentativas falharam
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code after ' . $maxAttempts . ' attempts. Last error: ' . $lastError,
                'attempts' => $maxAttempts
            ], 500);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get instance status from API
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

        DB::beginTransaction();

        try {
            // Guardar referência da conta antes de deletar
            $account = $whatsapp->uazApiAccount;

            // Deletar instância na API primeiro
            $this->uazApiService->deleteInstance($whatsapp->token);

            // Deletar conexão do banco de dados
            $whatsapp->delete();

            // Decrementar contador de conexões da conta (libera slot)
            if ($account) {
                $account->decrementConnections();
            }

            DB::commit();

            return redirect()->route('whatsapp.index')
                ->with('success', 'WhatsApp connection deleted successfully.');
        } catch (Exception $e) {
            DB::rollBack();

            // Se falhou ao deletar na API, ainda assim deletar do banco
            // pois a instância pode não existir mais na API
            Log::warning('Failed to delete instance, deleting from database anyway', [
                'token' => $whatsapp->token,
                'error' => $e->getMessage()
            ]);

            // Guardar referência da conta antes de deletar
            $account = $whatsapp->uazApiAccount;

            $whatsapp->delete();

            // Decrementar contador de conexões da conta (libera slot)
            if ($account) {
                $account->decrementConnections();
            }

            return redirect()->route('whatsapp.index')
                ->with('warning', 'WhatsApp connection deleted, but there was an issue with the external API.');
        }
    }

    /**
     * Verificar e atualizar status de uma conexão
     */
    private function checkAndUpdateConnectionStatus(WhatsAppConnection $connection)
    {
        // Só verificar se a conexão tem token
        if (!$connection->token) {
            return;
        }

        try {
            $statusData = $this->uazApiService->getInstanceStatus($connection->token);
            $newStatus = $statusData['instance']['status'] ?? 'unknown';
            $owner = $statusData['instance']['owner'] ?? null;

            // Atualizar status se mudou
            if ($connection->status !== $newStatus) {
                $updateData = ['status' => $newStatus];

                // Se conectado e tem owner, atualizar phone também
                if ($newStatus === 'connected' && !empty($owner)) {
                    $updateData['phone'] = $owner;
                }

                $connection->update($updateData);
            }
        } catch (Exception $e) {
            Log::error('Failed to check connection status', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()
            ]);

            $connection->update(['status' => 'error']);
        }
    }
}
