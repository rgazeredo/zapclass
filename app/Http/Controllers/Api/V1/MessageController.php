<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendTextMessageRequest;
use App\Models\WhatsAppConnection;
use App\Services\UazApiService;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * @tags Mensagens
 */

class MessageController extends Controller
{
    protected UazApiService $uazApiService;

    public function __construct(UazApiService $uazApiService)
    {
        $this->uazApiService = $uazApiService;
    }

    public function text(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'message' => 'required|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'link_preview' => 'nullable|boolean',
                'link_preview_title' => 'nullable|string',
                'link_preview_description' => 'nullable|string',
                'link_preview_image' => 'nullable|string',
                'link_preview_large' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesText($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de texto: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function image(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'file' => 'nullable|string',
                'message' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesImage($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de imagem: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function audio(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'file' => 'nullable|string',
                'message' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesAudio($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de áudio: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function record(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'file' => 'nullable|string',
                'message' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesRecord($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de áudio gravado: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function video(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'file' => 'nullable|string',
                'message' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesVideo($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de vídeo: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function document(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'file' => 'nullable|string',
                'message' => 'nullable|string',
                'delay' => 'nullable|integer',
                'filename' => 'nullable|string',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesDocument($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de documento: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function download(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'required|string',
                'mp3' => 'nullable|boolean',
                'base64' => 'nullable|boolean',
                'link' => 'nullable|boolean',
                'quoted' => 'nullable|boolean',
                'openai_api_key' => 'nullable|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesDownload($connection, $request->all());

            $url = str_replace('https://w4digital.uazapi.com/files', url('/download-file'), $response['url']);

            return response()->json([
                'success' => true,
                'url' => $url,
                'base64' => $response['base64Data'],
                'mimetype' => $response['mimetype'],
                'transcription' => $response['transcription']
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao baixar arquivo: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function downloadFile(string $fileId)
    {
        // Monta a URL original do arquivo no uazapi
        $url = "https://w4digital.uazapi.com/files/{$fileId}";

        try {
            $client = new Client();
            $response = $client->get($url, ['stream' => true]);

            // Obtém headers originais
            $contentType = $response->getHeaderLine('Content-Type') ?: 'application/octet-stream';

            // Tenta extrair nome do arquivo do header, se existir
            $disposition = $response->getHeaderLine('Content-Disposition');
            $filename = null;

            if (preg_match('/filename="?([^"]+)"?/i', $disposition, $matches)) {
                $filename = $matches[1];
            } else {
                // Se não houver nome no header, cria um genérico
                // Se o mimetype for conhecido, tenta adivinhar a extensão
                $extension = explode('/', $contentType)[1] ?? 'bin';
                $filename = "{$fileId}.{$extension}";
            }

            // Retorna streaming direto (sem salvar localmente)
            return Response::stream(function () use ($response) {
                echo $response->getBody()->getContents();
            }, 200, [
                'Content-Type' => $contentType,
                'Content-Disposition' => "inline; filename=\"{$filename}\"",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Falha ao acessar o arquivo remoto',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function menuList(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'title' => 'required|string',
                'choices' => 'required|array',
                'description' => 'nullable|string',
                'button_text' => 'nullable|string',
                'delay' => 'nullable|integer',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesMenuList($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de menu: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function menuButton(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'title' => 'required|string',
                'choices' => 'required|array',
                'description' => 'nullable|string',
                'button_image' => 'nullable|string',
                'delay' => 'nullable|integer',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesMenuButton($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de menu botão: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function menuPoll(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'title' => 'required|string',
                'choices' => 'required|array',
                'answers' => 'nullable|integer',
                'delay' => 'nullable|integer',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesMenuPoll($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de menu poll: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function menuCarousel(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'title' => 'required|string',
                'choices' => 'required|array',
                'delay' => 'nullable|integer',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesMenuCarousel($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de menu carousel: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function status(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'type' => 'required|string',
                'message' => 'nullable|string',
                'background' => 'nullable|integer',
                'font' => 'nullable|integer',
                'file' => 'nullable|string',
                'thumbnail' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $this->uazApiService->messagesStatus($connection, $request->all());

            return response()->json(['success' => true], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de status: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function find(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'nullable|string',
                'chat_id' => 'nullable|string',
                'limit' => 'nullable|integer',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesFind($connection, $request->all());

            $messages = [];

            foreach ($response['messages'] as $message) {
                $messages[] = [
                    'id' => $message['id'],
                    'chat_id' => $message['chatid'],
                    'message' => $message['text'],
                    'timestamp' => $message['messageTimestamp'],
                    'from_me' => $message['fromMe'],
                    'message_source' => $message['track_source'],
                    'message_id' => $message['track_id']
                ];
            }

            return response()->json([
                'success' => true,
                'messages' => $messages
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao buscar mensagens: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function edit(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'required|string',
                'message' => 'required|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $this->uazApiService->messagesEdit($connection, $request->all());

            return response()->json(['success' => true], 200);
        } catch (Exception $e) {
            Log::error('Erro ao editar mensagem: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function delete(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'id' => 'required|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $this->uazApiService->messagesDelete($connection, $request->all());

            return response()->json(['success' => true], 200);
        } catch (Exception $e) {
            Log::error('Erro ao excluir mensagem: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function contact(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'name' => 'required|string',
                'phones' => 'required|string',
                'company' => 'nullable|string',
                'email' => 'nullable|string',
                'url' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesContact($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de contato: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function location(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'latitude' => 'required|string',
                'longitude' => 'required|string',
                'location' => 'nullable|string',
                'address' => 'nullable|string',
                'delay' => 'nullable|integer',
                'forward' => 'nullable|boolean',
                'message_repy_id' => 'nullable|string',
                'message_source' => 'nullable|string',
                'message_id' => 'nullable|string',
                'mentions' => 'nullable|string',
                'read' => 'nullable|boolean',
                'read_messages' => 'nullable|boolean',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $response = $this->uazApiService->messagesLocation($connection, $request->all());

            return response()->json([
                'success' => true,
                'id' => $response['id'],
                'chat_id' => $response['chatid'],
            ], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar mensagem de localização: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function read(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $this->uazApiService->messagesRead($connection, $request->all());

            return response()->json(['success' => true], 200);
        } catch (Exception $e) {
            Log::error('Erro ao marcar mensagens como lidas: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    public function react(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Exemplos de respostas que o Scramble pode detectar
            if (!$connection) {
                abort(400, 'Token de autorização não fornecido');
            }

            // Validar se temos os dados necessários para chamar a API
            if (!$connection->token || !$connection->instance_id) {
                abort(500, 'Conexão não configurada adequadamente. Entre em contato com o suporte.');
            }

            // Valida se recebeu os campos obrigatórios da requisição
            $validator = Validator::make($request->all(), [
                'number' => 'required|string',
                'message' => 'required|string',
                'id' => 'required|string',
            ]);


            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Dados inválidos', 'errors' => $validator->errors()], 400);
            }

            $this->uazApiService->messagesReact($connection, $request->all());

            return response()->json(['success' => true], 200);
        } catch (Exception $e) {
            Log::error('Erro ao enviar reação à mensagem: ' . $e->getMessage());
            return $this->errorResponse(
                'Erro interno do servidor. Tente novamente em alguns instantes.',
                500
            );
        }
    }

    /**
     * Consultar status de uma mensagem enviada
     *
     * Retorna o status atual de uma mensagem específica identificada pelo message_id.
     * Útil para rastrear se a mensagem foi entregue ao destinatário.
     *
     * @param Request $request Requisição HTTP
     * @param string $messageId ID único da mensagem retornado no envio
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Operação realizada com sucesso",
     *   "data": {
     *     "message_id": "msg_abc123def456ghi789",
     *     "status": "delivered",
     *     "timestamp": "2024-01-15T10:35:20.000000Z",
     *     "connection_id": "zapclass_123"
     *   },
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Token de API inválido ou expirado",
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Erro ao consultar status da mensagem",
     *   "timestamp": "2024-01-15T10:35:20.000000Z"
     * }
     *
     * @authenticated
     */
    public function getMessageStatus(Request $request, string $messageId): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            // Por enquanto, retornamos um status genérico
            // Futuramente pode ser implementado tracking real via webhooks
            return $this->successResponse([
                'message_id' => $messageId,
                'status' => 'delivered', // sent, delivered, read, failed
                'timestamp' => now()->toISOString(),
                'connection_id' => $connection->client_instance_id,
            ]);
        } catch (Exception $e) {
            Log::error('API: Erro ao consultar status da mensagem', [
                'message_id' => $messageId,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erro ao consultar status da mensagem', 500);
        }
    }

    /**
     * Obter informações da conexão WhatsApp
     *
     * Retorna detalhes sobre a conexão WhatsApp associada ao token de API,
     * incluindo status, telefone conectado e informações de uso da API.
     *
     * @param Request $request Requisição HTTP
     * @return JsonResponse
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Operação realizada com sucesso",
     *   "data": {
     *     "connection_id": "zapclass_123",
     *     "name": "Conexão Principal",
     *     "status": "connected",
     *     "phone": "5511999999999",
     *     "api_usage_count": 42,
     *     "api_rate_limit": 1000,
     *     "api_last_used": "2024-01-15T10:25:30.000000Z"
     *   },
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 401 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Token de API inválido ou expirado",
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @response 500 {
     *   "success": false,
     *   "error": "api_error",
     *   "message": "Erro ao obter informações da conexão",
     *   "timestamp": "2024-01-15T10:30:45.000000Z"
     * }
     *
     * @authenticated
     */
    public function getConnectionInfo(Request $request): JsonResponse
    {
        try {
            $connection = $request->attributes->get('api_connection');

            return $this->successResponse([
                'connection_id' => $connection->client_instance_id,
                'name' => $connection->name,
                'status' => $connection->status,
                'phone' => $connection->phone,
                'api_usage_count' => $connection->api_usage_count,
                'api_rate_limit' => $connection->api_rate_limit,
                'api_last_used' => $connection->api_last_used_at?->toISOString(),
            ]);
        } catch (Exception $e) {
            Log::error('API: Erro ao obter informações da conexão', [
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erro ao obter informações da conexão', 500);
        }
    }

    /**
     * Resposta de sucesso padronizada
     */
    private function successResponse(array $data, string $message = 'Operação realizada com sucesso'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Resposta de erro padronizada
     */
    private function errorResponse(string $message, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => 'api_error',
            'message' => $message,
            'timestamp' => now()->toISOString()
        ], $status);
    }
}
