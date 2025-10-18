<?php

namespace App\Services;

use App\Models\UazApiAccount;
use App\Models\WhatsAppConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class UazApiService
{
    protected ApiLogger $logger;

    public function __construct(ApiLogger $logger)
    {
        $this->logger = $logger;

        // Propagar trace_id do request se existir
        if (request()->attributes->has('trace_id')) {
            $this->logger->setTraceId(request()->attributes->get('trace_id'));
        }
    }

    /**
     * Busca uma conta UazAPI disponível ou retorna erro
     */
    protected function getAvailableAccount(): UazApiAccount
    {
        Log::info('=== UAZ API: Buscando conta disponível ===');

        $account = UazApiAccount::findAvailableAccount();

        if (!$account) {
            Log::error('=== UAZ API: Nenhuma conta disponível ===', [
                'total_accounts' => UazApiAccount::count(),
                'all_accounts' => UazApiAccount::all()->map(function($acc) {
                    return [
                        'id' => $acc->id,
                        'name' => $acc->name,
                        'active_connections' => $acc->active_connections,
                        'max_connections' => $acc->max_connections,
                        'available' => $acc->active_connections < $acc->max_connections,
                    ];
                }),
            ]);

            throw new Exception('Nenhuma conta UazAPI disponível. Todos os planos atingiram o limite de conexões.');
        }

        Log::info('=== UAZ API: Conta disponível encontrada ===', [
            'account_id' => $account->id,
            'account_name' => $account->name,
            'base_url' => $account->base_url,
            'active_connections' => $account->active_connections,
            'max_connections' => $account->max_connections,
        ]);

        return $account;
    }

    /**
     * Retorna a conta UazAPI de uma conexão específica
     */
    protected function getConnectionAccount(WhatsAppConnection $connection): UazApiAccount
    {
        if (!$connection->uaz_api_account_id || !$connection->uazApiAccount) {
            throw new Exception('Conexão não possui conta UazAPI vinculada');
        }

        return $connection->uazApiAccount;
    }

    /**
     * Criar uma nova instância
     *
     * @param array $options Opções adicionais para a instância
     * @return array Retorna ['data' => resposta da API, 'account' => UazApiAccount usada]
     * @throws Exception
     */
    public function createInstance(array $options = []): array
    {
        Log::info('=== UAZ API: Iniciando criação de instância ===', [
            'options' => $options,
        ]);

        // Busca conta disponível
        $account = $this->getAvailableAccount();

        $url = $account->base_url . '/instance/init';
        $headers = [
            'admintoken' => $account->admin_token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
        $payload = [
            'name' => $options['name'],
            'systemName' => $options['system_name'],
            'adminField01' => $options['admin_field_1'] ?? null,
            'adminField02' => $options['admin_field_2'] ?? null,
            'webhook_url' => config('app.url') . '/api/whatsapp/webhook',
        ];

        Log::info('=== UAZ API: Fazendo requisição para criar instância ===', [
            'url' => $url,
            'payload' => $payload,
            'headers' => array_merge($headers, ['admintoken' => substr($account->admin_token, 0, 10) . '...']),
        ]);

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->post($url, $payload);

            Log::info('=== UAZ API: Resposta recebida ===', [
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'body_preview' => substr($response->body(), 0, 500),
            ]);

            // Log da requisição
            $this->logger->logOutbound(
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $payload,
                response: $response,
                action: 'create_instance',
                connection: null,
                metadata: [
                    'instance_name' => $options['name'],
                    'system_name' => $options['system_name'],
                    'uaz_api_account_id' => $account->id,
                    'uaz_api_account_name' => $account->name,
                ]
            );

            if (!$response->successful()) {
                Log::error('=== UAZ API: Falha na criação da instância ===', [
                    'status_code' => $response->status(),
                    'response_body' => $response->body(),
                ]);

                throw new Exception('Falha ao criar instância: ' . $response->body());
            }

            $responseData = $response->json();

            Log::info('=== UAZ API: Instância criada com sucesso ===', [
                'response_data' => $responseData,
            ]);

            // Retorna dados da resposta + a conta usada
            return [
                'data' => $responseData,
                'account' => $account,
            ];
        } catch (Exception $e) {
            Log::error('=== UAZ API: Exceção ao criar instância ===', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
            ]);

            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $payload,
                exception: $e,
                action: 'create_instance',
                connection: null,
                metadata: [
                    'instance_name' => $options['name'],
                    'uaz_api_account_id' => $account->id,
                ]
            );

            throw $e;
        }
    }

    /**
     * Atualizar uma instância
     *
     * @param WhatsAppConnection $connection
     * @param string $instanceName
     * @return array
     * @throws Exception
     */
    public function updateInstance(WhatsAppConnection $connection, string $instanceName): array
    {
        $account = $this->getConnectionAccount($connection);

        try {
            Log::error('API Error: updateInstance', [
                'instanceName' => $instanceName,
                'uaz_api_account_id' => $account->id,
            ]);

            $response = Http::withHeaders([
                'token' => $connection->token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($account->base_url . '/instance/updateInstanceName', [
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
     * @param WhatsAppConnection $connection
     * @param string $instanceId
     * @param string $adminField01
     * @param string $adminField02
     * @return array
     * @throws Exception
     */
    public function updateAdminFields(WhatsAppConnection $connection, string $instanceId, ?string $adminField01 = null, ?string $adminField02 = null): array
    {
        $account = $this->getConnectionAccount($connection);

        try {
            Log::error('API: updateAdminFields', [
                'instanceId' => $instanceId,
                'adminField01' => $adminField01,
                'adminField02' => $adminField02,
                'uaz_api_account_id' => $account->id,
            ]);

            $response = Http::withHeaders([
                'admintoken' => $account->admin_token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($account->base_url . '/instance/updateAdminFields', [
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
        $connection = WhatsAppConnection::where('token', $token)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        $url = $account->base_url . '/instance/status';
        $headers = [
            'token' => $token,
            'Accept' => 'application/json',
        ];

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->get($url);

            // Log da requisição
            $this->logger->logOutbound(
                method: 'GET',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                response: $response,
                action: 'get_instance_status',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

            if (!$response->successful()) {
                throw new Exception('Falha ao obter status da instância: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'GET',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                exception: $e,
                action: 'get_instance_status',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

            throw $e;
        }
    }

    /**
     * Deletar uma instância
     *
     * @param string $token
     * @return bool
     * @throws Exception
     */
    public function deleteInstance(string $token): bool
    {
        try {
            $connection = WhatsAppConnection::where('token', $token)->first();

            if (!$connection || !$connection->uazApiAccount) {
                Log::warning('API: deleteInstance - conexão ou conta não encontrada', [
                    'token' => $token
                ]);
                // Tenta deletar mesmo sem ter a conta (fallback)
                $url = 'https://w4digital.uazapi.com/instance'; // URL padrão como fallback
            } else {
                $account = $connection->uazApiAccount;
                $url = $account->base_url . '/instance';
            }

            Log::error('API Error: deleteInstance', [
                'token' => $token,
                'url' => $url
            ]);

            $response = Http::withHeaders([
                'token' => $token,
                'Accept' => 'application/json',
            ])->delete($url);

            if (!$response->successful()) {
                Log::error('API Error: deleteInstance', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'token' => $token
                ]);

                // Não lançar exception para delete, pois pode já ter sido deletada
                return false;
            }

            Log::info('API Instance Deleted: deleteInstance', [
                'token' => $token
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('API Delete Exception: deleteInstance', [
                'message' => $e->getMessage(),
                'token' => $token
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
        $connection = WhatsAppConnection::where('token', $instanceToken)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        $url = $account->base_url . '/instance/disconnect';
        $headers = [
            'token' => $instanceToken,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->post($url, new \stdClass());

            // Log da requisição
            $this->logger->logOutbound(
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                response: $response,
                action: 'disconnect_instance',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

            if (!$response->successful()) {
                throw new Exception('Falha ao desconectar instância: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                exception: $e,
                action: 'disconnect_instance',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

            throw $e;
        }
    }

    public function messagesText(WhatsAppConnection $connection, array $payload): array
    {
        $account = $this->getConnectionAccount($connection);

        $url = $account->base_url . '/send/text';
        $headers = [
            'token' => $connection->token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        // Tradução dos campos da sua API para a API do UazAPI
        $requestData = [
            'number' => $payload['number'], // Obrigatório
            'text' => $payload['message'], // message → text (Obrigatório)
        ];

        // Campos opcionais - Link Preview
        if (isset($payload['link_preview'])) {
            $requestData['linkPreview'] = $payload['link_preview']; // link_preview → linkPreview
        }
        if (isset($payload['link_preview_title'])) {
            $requestData['linkPreviewTitle'] = $payload['link_preview_title']; // link_preview_title → linkPreviewTitle
        }
        if (isset($payload['link_preview_description'])) {
            $requestData['linkPreviewDescription'] = $payload['link_preview_description']; // link_preview_description → linkPreviewDescription
        }
        if (isset($payload['link_preview_image'])) {
            $requestData['linkPreviewImage'] = $payload['link_preview_image']; // link_preview_image → linkPreviewImage
        }
        if (isset($payload['link_preview_large'])) {
            $requestData['linkPreviewLarge'] = $payload['link_preview_large']; // link_preview_large → linkPreviewLarge
        }

        // Campos opcionais - Resposta e menções
        if (isset($payload['message_repy_id'])) {
            $requestData['replyid'] = $payload['message_repy_id']; // message_repy_id → replyid
        }
        if (isset($payload['mentions'])) {
            $requestData['mentions'] = $payload['mentions']; // mentions → mentions (igual)
        }

        // Campos opcionais - Leitura
        if (isset($payload['read'])) {
            $requestData['readchat'] = $payload['read']; // read → readchat
        }
        if (isset($payload['read_messages'])) {
            $requestData['readmessages'] = $payload['read_messages']; // read_messages → readmessages
        }

        // Campos opcionais - Comportamento
        if (isset($payload['delay'])) {
            $requestData['delay'] = (int) $payload['delay']; // delay → delay (converter para integer)
        }
        if (isset($payload['forward'])) {
            $requestData['forward'] = (bool) $payload['forward']; // forward → forward (converter para boolean)
        }

        // Campos opcionais - Rastreamento
        if (isset($payload['message_source'])) {
            $requestData['track_source'] = $payload['message_source']; // message_source → track_source
        }
        if (isset($payload['message_id'])) {
            $requestData['track_id'] = $payload['message_id']; // message_id → track_id
        }

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->post($url, $requestData);

            // Log da requisição
            $this->logger->logOutbound(
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $requestData,
                response: $response,
                action: 'send_text_message',
                connection: $connection,
                metadata: [
                    'recipient' => $payload['number'],
                    'message_preview' => substr($payload['message'], 0, 100),
                ]
            );

            if (!$response->successful()) {
                throw new Exception('Falha ao enviar mensagem: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $requestData,
                exception: $e,
                action: 'send_text_message',
                connection: $connection,
                metadata: ['recipient' => $payload['number']]
            );

            throw $e;
        }
    }

    /**
     * Enviar mensagem de mídia (imagem, vídeo, documento, áudio)
     *
     * @param WhatsAppConnection $connection
     * @param array $payload
     * @return array
     * @throws Exception
     */
    public function messagesMedia(WhatsAppConnection $connection, array $payload): array
    {
        $account = $this->getConnectionAccount($connection);

        $url = $account->base_url . '/send/media';
        $headers = [
            'token' => $connection->token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        // Tradução dos campos da sua API para a API do UazAPI
        $requestData = [
            'number' => $payload['number'], // Obrigatório
            'type' => $payload['type'], // Obrigatório (image, video, document, audio, myaudio, ptt, sticker)
            'file' => $payload['file'], // Obrigatório (URL ou base64)
        ];

        // Campos opcionais - Caption/Texto
        if (isset($payload['message'])) {
            $requestData['text'] = $payload['message']; // message → text (caption/legenda)
        }

        // Campo opcional - Nome do documento
        if (isset($payload['doc_name'])) {
            $requestData['docName'] = $payload['doc_name']; // doc_name → docName
        } elseif (isset($payload['document_name'])) {
            $requestData['docName'] = $payload['document_name']; // document_name → docName (alternativa)
        }

        // Campos opcionais - Resposta e menções
        if (isset($payload['message_repy_id'])) {
            $requestData['replyid'] = $payload['message_repy_id']; // message_repy_id → replyid
        }
        if (isset($payload['mentions'])) {
            $requestData['mentions'] = $payload['mentions']; // mentions → mentions (igual)
        }

        // Campos opcionais - Leitura
        if (isset($payload['read'])) {
            $requestData['readchat'] = $payload['read']; // read → readchat
        }
        if (isset($payload['read_messages'])) {
            $requestData['readmessages'] = $payload['read_messages']; // read_messages → readmessages
        }

        // Campos opcionais - Comportamento
        if (isset($payload['delay'])) {
            $requestData['delay'] = (int) $payload['delay']; // delay → delay (converter para integer)
        }
        if (isset($payload['forward'])) {
            $requestData['forward'] = (bool) $payload['forward']; // forward → forward (converter para boolean)
        }

        // Campos opcionais - Rastreamento
        if (isset($payload['message_source'])) {
            $requestData['track_source'] = $payload['message_source']; // message_source → track_source
        }
        if (isset($payload['message_id'])) {
            $requestData['track_id'] = $payload['message_id']; // message_id → track_id
        }

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->post($url, $requestData);

            // Log da requisição
            $this->logger->logOutbound(
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $requestData,
                response: $response,
                action: 'send_media_message',
                connection: $connection,
                metadata: [
                    'recipient' => $payload['number'],
                    'media_type' => $payload['type'],
                ]
            );

            if (!$response->successful()) {
                throw new Exception('Falha ao enviar mídia: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: $requestData,
                exception: $e,
                action: 'send_media_message',
                connection: $connection,
                metadata: [
                    'recipient' => $payload['number'],
                    'media_type' => $payload['type'] ?? null,
                ]
            );

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
        $connection = WhatsAppConnection::where('token', $instanceToken)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        $url = $account->base_url . '/instance/connect';
        $headers = [
            'token' => $instanceToken,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        $this->logger->startTimer();

        try {
            $response = Http::withHeaders($headers)->post($url, new \stdClass());

            // Log da requisição
            $this->logger->logOutbound(
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                response: $response,
                action: 'get_qr_code',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

            $json = $response->json();

            if (empty($json) || empty($json['instance']['qrcode'])) {
                throw new Exception('Falha ao obter QR Code: ' . $response->body());
            }

            return $json;
        } catch (Exception $e) {
            // Log da exception
            $this->logger->logException(
                direction: 'outbound',
                method: 'POST',
                url: $url,
                requestHeaders: $headers,
                requestBody: [],
                exception: $e,
                action: 'get_qr_code',
                connection: $connection,
                metadata: ['uaz_api_account_id' => $account->id]
            );

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
        $connection = WhatsAppConnection::where('token', $instanceToken)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        try {
            // Preparar dados conforme documentação API
            $payload = [
                'id' => $webhookData['id'],
                'action' => 'add',
                'url' => $webhookData['url']
            ];

            // Adicionar campo enabled (boolean)
            if (isset($webhookData['enabled'])) {
                $payload['enabled'] = (bool) $webhookData['enabled'];
            }

            // Adicionar eventos se especificados (API espera array, não string)
            if (isset($webhookData['events'])) {
                $payload['events'] = is_string($webhookData['events'])
                    ? explode(',', $webhookData['events'])
                    : $webhookData['events'];
            }

            // Adicionar eventos de exclusão se especificados (API espera array, não string)
            if (isset($webhookData['excludeMessages'])) {
                $payload['excludeMessages'] = is_string($webhookData['excludeMessages'])
                    ? explode(',', $webhookData['excludeMessages'])
                    : $webhookData['excludeMessages'];
            }

            Log::info('API: Criando webhook via', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'payload' => $payload,
                'uaz_api_account_id' => $account->id,
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($account->base_url . '/webhook', $payload);

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
     * @param string $externalWebhookId ID externo do webhook para remover
     * @return array
     * @throws Exception
     */
    public function deleteWebhook(string $instanceToken, string $instanceId, string $externalWebhookId): array
    {
        $connection = WhatsAppConnection::where('token', $instanceToken)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        try {
            // Preparar dados conforme documentação API
            $payload = [
                'action' => 'delete',
                'id' => $externalWebhookId
            ];

            Log::info('API: Deletando webhook via ID externo', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'external_webhook_id' => $externalWebhookId,
                'payload' => $payload,
                'uaz_api_account_id' => $account->id,
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($account->base_url . '/webhook', $payload);

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
                'external_webhook_id' => $externalWebhookId,
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Delete Webhook Exception', [
                'message' => $e->getMessage(),
                'external_webhook_id' => $externalWebhookId,
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
     * @param array $webhookData Dados do webhook (deve incluir 'id' como external_webhook_id)
     * @return array
     * @throws Exception
     */
    public function updateWebhook(string $instanceToken, string $instanceId, array $webhookData): array
    {
        $connection = WhatsAppConnection::where('token', $instanceToken)->first();

        if (!$connection) {
            throw new Exception('Conexão não encontrada para o token fornecido');
        }

        $account = $this->getConnectionAccount($connection);

        try {
            // Preparar dados conforme documentação API
            $payload = [
                'action' => 'update',
                'id' => $webhookData['id'], // Usar external_webhook_id
                'url' => $webhookData['url']
            ];

            // Adicionar campo enabled (boolean)
            if (isset($webhookData['enabled'])) {
                $payload['enabled'] = (bool) $webhookData['enabled'];
            }

            // Adicionar eventos se especificados (API espera array, não string)
            if (isset($webhookData['events'])) {
                $payload['events'] = is_string($webhookData['events'])
                    ? explode(',', $webhookData['events'])
                    : $webhookData['events'];
            }

            // Adicionar eventos de exclusão se especificados (API espera array, não string)
            if (isset($webhookData['excludeMessages'])) {
                $payload['excludeMessages'] = is_string($webhookData['excludeMessages'])
                    ? explode(',', $webhookData['excludeMessages'])
                    : $webhookData['excludeMessages'];
            }

            Log::info('API: Editando webhook via ID externo', [
                'instance_token' => substr($instanceToken, 0, 10) . '...',
                'instance_id' => $instanceId,
                'external_webhook_id' => $webhookData['id'],
                'payload' => $payload,
                'uaz_api_account_id' => $account->id,
            ]);

            $response = Http::withHeaders([
                'token' => $instanceToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($account->base_url . '/webhook', $payload);

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
                'external_webhook_id' => $webhookData['id'],
                'response' => $data
            ]);

            return $data;
        } catch (Exception $e) {
            Log::error('API Update Webhook Exception', [
                'message' => $e->getMessage(),
                'external_webhook_id' => $webhookData['id'] ?? null,
                'instance_token' => substr($instanceToken, 0, 10) . '...'
            ]);

            throw $e;
        }
    }
}
