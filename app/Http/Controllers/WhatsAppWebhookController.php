<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle webhook from API
     */
    public function handle(Request $request)
    {
        try {
            $data = $request->all();

            Log::info('WhatsApp Webhook Received', $data);

            // Verificar se temos os dados necessários
            if (!isset($data['instance_name']) || !isset($data['event'])) {
                Log::warning('WhatsApp Webhook: Missing required fields', $data);
                return response()->json(['status' => 'error', 'message' => 'Missing required fields'], 400);
            }

            $instanceName = $data['instance_name'];
            $event = $data['event'];

            // Extrair tenant_slug e system_name do instance_name
            $parts = explode('_', $instanceName, 2);
            if (count($parts) !== 2) {
                Log::warning('WhatsApp Webhook: Invalid instance_name format', ['instance_name' => $instanceName]);
                return response()->json(['status' => 'error', 'message' => 'Invalid instance name format'], 400);
            }

            [$tenantSlug, $systemName] = $parts;

            // Encontrar a conexão
            $connection = WhatsAppConnection::whereHas('tenant', function ($query) use ($tenantSlug) {
                $query->where('slug', $tenantSlug);
            })->where('system_name', $systemName)->first();

            if (!$connection) {
                Log::warning('WhatsApp Webhook: Connection not found', [
                    'tenant_slug' => $tenantSlug,
                    'system_name' => $systemName
                ]);
                return response()->json(['status' => 'error', 'message' => 'Connection not found'], 404);
            }

            // Processar evento
            $this->processEvent($connection, $event, $data);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('WhatsApp Webhook Error', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }

    /**
     * Process webhook event
     */
    private function processEvent(WhatsAppConnection $connection, string $event, array $data)
    {
        switch ($event) {
            case 'qr_code':
                $connection->update([
                    'status' => 'connecting',
                ]);
                Log::info('WhatsApp QR Code generated', ['connection_id' => $connection->id]);
                break;

            case 'connected':
                $connection->update([
                    'status' => 'connected',
                    'phone' => $data['phone'] ?? $connection->phone,
                ]);
                Log::info('WhatsApp connected', ['connection_id' => $connection->id]);
                break;

            case 'disconnected':
                $connection->update([
                    'status' => 'disconnected',
                ]);
                Log::info('WhatsApp disconnected', ['connection_id' => $connection->id]);
                break;

            case 'error':
                $connection->update([
                    'status' => 'error',
                ]);
                Log::error('WhatsApp error', [
                    'connection_id' => $connection->id,
                    'error' => $data['error'] ?? 'Unknown error'
                ]);
                break;

            default:
                Log::info('WhatsApp unknown event', [
                    'connection_id' => $connection->id,
                    'event' => $event,
                    'data' => $data
                ]);
                break;
        }
    }
}
