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
     * Criar uma nova instância na API UAZ
     *
     * @param string $instanceName Nome da instância
     * @param array $options Opções adicionais para a instância
     * @return array
     * @throws Exception
     */
    public function createInstance(string $instanceName, array $options = []): array
    {
        try {
            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::BASE_URL . '/instance/init', [
                'name' => $options['name'] ?? $instanceName,
                'systemName' => $instanceName,
                'adminField01' => $options['admin_field_1'] ?? null,
                'adminField02' => $options['admin_field_2'] ?? null,
                'webhook_url' => config('app.url') . '/api/whatsapp/webhook',
            ]);

            if (!$response->successful()) {
                Log::error('UAZ API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'instance_name' => $instanceName
                ]);

                throw new Exception('Falha ao criar instância na API UAZ: ' . $response->body());
            }

            $data = $response->json();

            Log::info('UAZ Instance Created', [
                'instance_name' => $instanceName,
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('UAZ API Exception', [
                'message' => $e->getMessage(),
                'instance_name' => $instanceName
            ]);

            throw $e;
        }
    }

    /**
     * Obter status de uma instância
     *
     * @param string $instanceName
     * @return array
     * @throws Exception
     */
    public function getInstanceStatus(string $instanceName): array
    {
        try {
            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Accept' => 'application/json',
            ])->get(self::BASE_URL . '/instance/status', [
                'instance_name' => $instanceName
            ]);

            if (!$response->successful()) {
                throw new Exception('Falha ao obter status da instância: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            Log::error('UAZ API Status Exception', [
                'message' => $e->getMessage(),
                'instance_name' => $instanceName
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
            $response = Http::withHeaders([
                'admintoken' => self::TOKEN,
                'Accept' => 'application/json',
            ])->delete(self::BASE_URL . '/instance/delete', [
                'instance_name' => $instanceName
            ]);

            if (!$response->successful()) {
                Log::warning('UAZ API Delete Warning', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'instance_name' => $instanceName
                ]);

                // Não lançar exception para delete, pois pode já ter sido deletada
                return false;
            }

            Log::info('UAZ Instance Deleted', [
                'instance_name' => $instanceName
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('UAZ API Delete Exception', [
                'message' => $e->getMessage(),
                'instance_name' => $instanceName
            ]);

            // Não lançar exception para delete
            return false;
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

            // if ($response->status() != 200) {
            //     throw new Exception('Falha ao obter QR Code: ' . $response->body() . ' - ' . self::BASE_URL . ' - ' . $instanceToken);
            // }

            // if (!$response->successful()) {
            //     throw new Exception('Falha ao obter QR Code: ' . $response->body() . ' - ' . self::BASE_URL . ' - ' . $instanceToken);
            // }

            return $response->json();
        } catch (Exception $e) {
            Log::error('UAZ API QR Exception', [
                'message' => $e->getMessage(),
                'instance_token' => $instanceToken
            ]);

            throw $e;
        }
    }
}
