<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class UazApiService
{
    // private const BASE_URL = 'https://api.uazapi.com';
    private const BASE_URL = 'https://w4digital.uazapi.com';
    private const TOKEN = 'X6qJRwJZ9UGQcvIcw5bvFrojp52YCtabXZBg2P4hajIJq97a30';

    /**
     * Criar uma nova instância
     *
     * @param array $options Opções adicionais para a instância
     * @return array
     * @throws Exception
     */
    public function createInstance(array $options = []): array
    {
        try {
            Log::error('API Error: createInstance', [
                'name' => $options['name'],
                'systemName' => $options['system_name'],
                'adminField01' => $options['admin_field_1'] ?? null,
                'adminField02' => $options['admin_field_2'] ?? null,
                'webhook_url' => config('app.url') . '/api/whatsapp/webhook',
            ]);

            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/init', [
                'name' => $options['name'],
                'systemName' => $options['system_name'],
                'adminField01' => $options['admin_field_1'] ?? null,
                'adminField02' => $options['admin_field_2'] ?? null,
                'webhook_url' => config('app.url') . '/api/whatsapp/webhook',
            ]);

            if (!$response->successful()) {
                Log::error('API Error: createInstance', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao criar instância: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Instance Created: createInstance', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Exception: createInstance', [
                'message' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Atualizar uma instância
     *
     * @param string $instanceName
     * @return array
     * @throws Exception
     */
    public function updateInstance(string $token, string $instanceName): array
    {
        try {
            Log::error('API Error: updateInstance', [
                'instanceName' => $instanceName
            ]);

            $response = Http::withHeaders([
                'token' => $token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/updateInstanceName', [
                'name' => $instanceName
            ]);

            if (!$response->successful()) {
                Log::error('API Error: updateInstance', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao atualizar instância: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Instance Updated: updateInstance', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Exception: updateInstance', [
                'message' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Atualizar os campos admin_field_1 e admin_field_2 de uma instância
     *
     * @param string $instanceId
     * @param string $adminField01
     * @param string $adminField02
     * @return array
     * @throws Exception
     */
    public function updateAdminFields(string $instanceId, ?string $adminField01 = null, ?string $adminField02 = null): array
    {
        try {
            Log::error('API: updateAdminFields', [
                'instanceId' => $instanceId,
                'adminField01' => $adminField01,
                'adminField02' => $adminField02
            ]);

            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/updateAdminFields', [
                'id' => $instanceId,
                'adminField01' => $adminField01,
                'adminField02' => $adminField02
            ]);

            if (!$response->successful()) {
                Log::error('API Error: updateAdminFields', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao atualizar campos admin_field_1 e admin_field_2: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Instance Updated: updateAdminFields', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Exception: updateAdminFields', [
                'message' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Obter status de uma instância
     *
     * @param string $token
     * @return array
     * @throws Exception
     */
    public function getInstanceStatus(string $token): array
    {
        try {

            Log::error('API Error: getInstanceStatus', [
                'token' => $token
            ]);

            $response = Http::withHeaders([
                'token' => $token,
                'Accept' => 'application/json',
            ])->get(self::BASE_URL . '/instance/status');

            if (!$response->successful()) {
                Log::error('API Error: getInstanceStatus', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao obter status da instância: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Instance Status: getInstanceStatus', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Status Exception: getInstanceStatus', [
                'message' => $e->getMessage(),
                'token' => $token
            ]);

            throw $e;
        }
    }

    /**
     * Deletar uma instância
     *
     * @param string $instanceName
     * @return bool
     * @throws Exception
     */
    public function deleteInstance(string $instanceName): bool
    {
        try {

            Log::error('API Error: deleteInstance', [
                'instanceName' => $instanceName
            ]);

            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Accept' => 'application/json',
            ])->delete(self::BASE_URL . '/instance/delete', [
                'instance_name' => $instanceName
            ]);

            if (!$response->successful()) {
                Log::error('API Error: deleteInstance', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'instance_name' => $instanceName
                ]);

                // Não lançar exception para delete, pois pode já ter sido deletada
                return false;
            }

            Log::info('API Instance Deleted: deleteInstance', [
                'instance_name' => $instanceName
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('API Delete Exception: deleteInstance', [
                'message' => $e->getMessage(),
                'instance_name' => $instanceName
            ]);

            // Não lançar exception para delete
            return false;
        }
    }

    /**
     * Desconectar uma instância do WhatsApp
     *
     * @param string $instanceToken Token específico da instância
     * @return array
     * @throws Exception
     */
    public function disconnectInstance(string $instanceToken): array
    {
        try {
            Log::info('API: disconnectInstance', [
                'instance_token' => $instanceToken
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/disconnect', new \stdClass());

            if (!$response->successful()) {
                Log::error('API Error: disconnectInstance', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao desconectar instância: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Instance Disconnected', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Disconnect Exception', [
                'message' => $e->getMessage(),
                'instance_token' => $instanceToken
            ]);

            throw $e;
        }
    }

    /**
     * Enviar mensagem de texto
     *
     * @param string $instanceToken Token específico da instância
     * @param array $messageData Dados da mensagem (recipient, text)
     * @return array
     * @throws Exception
     */
    public function sendMessage(string $instanceToken, array $messageData): array
    {
        try {
            Log::info('API: Enviando mensagem via', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'recipient' => $messageData['recipient']
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/send/text', [
                'number' => $messageData['recipient'],
                'text' => $messageData['text']
            ]);

            if (!$response->successful()) {
                Log::error('API Error: sendMessage', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new Exception('Falha ao enviar mensagem: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Message Sent: sendMessage', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Send Message Exception', [
                'message' => $e->getMessage(),
                'instance_token' => substr($instanceToken, 0, 10) . '...'
            ]);

            throw $e;
        }
    }

    /**
     * Obter QR Code para conectar WhatsApp
     *
     * @param string $instanceToken Token específico da instância
     * @return array
     * @throws Exception
     */
    public function getQrCode(string $instanceToken): array
    {
        try {
            // Formato correto encontrado através de testes: objeto vazio (stdClass)
            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/connect', new \stdClass());

            $json = $response->json();

            Log::info('API QR Code', [
                'instance' => $json['instance'],
                'qrcode' => $json['instance']['qrcode'],
            ]);

            if (empty($json) || empty($json['instance']['qrcode'])) {
                throw new Exception('Falha ao obter QR Code: ' . $response->body() . ' - ' . self::BASE_URL . ' - ' . $instanceToken);
            }

            return $json;
        } catch (Exception $e) {
            Log::error('API QR Exception', [
                'message' => $e->getMessage(),
                'instance_token' => $instanceToken
            ]);

            throw $e;
        }
    }

    /**
     * Criar webhook na API
     *
     * @param string $instanceToken Token específico da instância
     * @param string $instanceId ID da instância
     * @param array $webhookData Dados do webhook
     * @return array
     * @throws Exception
     */
    public function createWebhook(string $instanceToken, string $instanceId, array $webhookData): array
    {
        try {
            // Preparar dados conforme documentação API
            $payload = [
                'action' => 'add',
                'url' => $webhookData['url']
            ];

            // Adicionar eventos se especificados (API espera array, não string)
            if (isset($webhookData['events'])) {
                $payload['events'] = is_string($webhookData['events'])
                    ? explode(',', $webhookData['events'])
                    : $webhookData['events'];
            }

            // TODO: Reativar quando API corrigir o excludeMessages
            // Adicionar eventos de exclusão se especificados (API espera array, não string)
            // if (isset($webhookData['excludeMessages'])) {
            //     $payload['excludeMessages'] = is_string($webhookData['excludeMessages'])
            //         ? explode(',', $webhookData['excludeMessages'])
            //         : $webhookData['excludeMessages'];
            // }

            Log::info('API: Criando webhook via', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'payload' => $payload
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/webhook', $payload);

            if (!$response->successful()) {
                Log::error('API Error: createWebhook', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload' => $payload
                ]);

                throw new Exception('Falha ao criar webhook: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Webhook Created: createWebhook', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Create Webhook Exception', [
                'message' => $e->getMessage(),
                'instance_token' => substr($instanceToken, 0, 10) . '...'
            ]);

            throw $e;
        }
    }

    /**
     * Deletar webhook da API
     *
     * @param string $instanceToken Token específico da instância
     * @param string $instanceId ID da instância
     * @param string $webhookUrl URL do webhook para remover
     * @return array
     * @throws Exception
     */
    public function deleteWebhook(string $instanceToken, string $instanceId, string $webhookUrl): array
    {
        try {
            // Preparar dados conforme documentação API
            $payload = [
                'action' => 'remove',
                'url' => $webhookUrl
            ];

            Log::info('API: Deletando webhook via', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'payload' => $payload
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/webhook', $payload);

            if (!$response->successful()) {
                Log::error('API Error: deleteWebhook', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload' => $payload
                ]);

                throw new Exception('Falha ao deletar webhook: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Webhook Deleted: deleteWebhook', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Delete Webhook Exception', [
                'message' => $e->getMessage(),
                'instance_token' => substr($instanceToken, 0, 10) . '...'
            ]);

            throw $e;
        }
    }

    /**
     * Editar webhook na API
     *
     * @param string $instanceToken Token específico da instância
     * @param string $instanceId ID da instância
     * @param array $webhookData Dados do webhook
     * @return array
     * @throws Exception
     */
    public function updateWebhook(string $instanceToken, string $instanceId, array $webhookData): array
    {
        try {
            // Preparar dados conforme documentação API
            $payload = [
                'action' => 'edit',
                'url' => $webhookData['url']
            ];

            // Adicionar eventos se especificados (API espera array, não string)
            if (isset($webhookData['events'])) {
                $payload['events'] = is_string($webhookData['events'])
                    ? explode(',', $webhookData['events'])
                    : $webhookData['events'];
            }

            // TODO: Reativar quando API corrigir o excludeMessages
            // Adicionar eventos de exclusão se especificados (API espera array, não string)
            // if (isset($webhookData['excludeMessages'])) {
            //     $payload['excludeMessages'] = is_string($webhookData['excludeMessages'])
            //         ? explode(',', $webhookData['excludeMessages'])
            //         : $webhookData['excludeMessages'];
            // }

            Log::info('API: Editando webhook via', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'payload' => $payload
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/webhook', $payload);

            if (!$response->successful()) {
                Log::error('API Error: updateWebhook', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload' => $payload
                ]);

                throw new Exception('Falha ao editar webhook: ' . $response->body());
            }

            $data = $response->json();

            Log::info('Webhook Updated: updateWebhook', [
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Update Webhook Exception', [
                'message' => $e->getMessage(),
                'instance_token' => substr($instanceToken, 0, 10) . '...'
            ]);

            throw $e;
        }
    }
}
