<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SendTextMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Autorização é feita pelo middleware ApiAuthentication
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            /**
             * Número do destinatário no formato internacional brasileiro
             * Deve incluir código do país (55) + DDD + número
             * @example "5511987654321"
             */
            'recipient' => 'required|string|regex:/^55[1-9][0-9]{9,10}$/',

            /**
             * Conteúdo da mensagem de texto a ser enviada
             * Suporta texto simples, emojis e caracteres especiais
             * @example "Olá! Bem-vindo à nossa plataforma ZapClass 🚀"
             */
            'text_message' => 'required|string|max:4096',

            /**
             * Controla se links na mensagem devem exibir prévia automática
             * true: exibe prévia, false: apenas o link
             * @example true
             */
            'linkPreview' => 'sometimes|boolean',

            /**
             * Atraso em segundos antes do envio (agendamento)
             * Útil para envios programados ou intervalos entre mensagens
             * @example 0
             */
            'delayMessage' => 'sometimes|integer|min:0|max:3600',

            /**
             * Mencionar todos os participantes do grupo (apenas para grupos)
             * true: menciona @todos, false: mensagem normal
             * @example false
             */
            'mentionEveryone' => 'sometimes|boolean',

            /**
             * Lista de contatos a serem mencionados na mensagem
             * Array de números de telefone para mencionar especificamente
             * @example ["5511999999999", "5511888888888"]
             */
            'mentioned' => 'sometimes|array',
            'mentioned.*' => 'string|regex:/^55[1-9][0-9]{9,10}$/',

            /**
             * ID da mensagem para responder (criar thread)
             * Cria uma resposta vinculada à mensagem original
             * @example "msg_abc123xyz789"
             */
            'messageToReply' => 'sometimes|string|max:100',

            /**
             * Identificador personalizado para controle interno
             * Útil para rastrear mensagens em seu sistema
             * @example "order_2024_12345"
             */
            'trackingId' => 'sometimes|string|max:50|regex:/^[a-zA-Z0-9_-]+$/',
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'recipient.required' => 'O número do destinatário é obrigatório',
            'recipient.regex' => 'O número deve estar no formato: 55 + DDD + telefone (ex: 5511987654321)',
            'text_message.required' => 'O conteúdo da mensagem é obrigatório',
            'text_message.max' => 'A mensagem não pode exceder 4096 caracteres',
            'linkPreview.boolean' => 'O campo de prévia de link deve ser verdadeiro ou falso',
            'delayMessage.integer' => 'O atraso deve ser um número inteiro',
            'delayMessage.min' => 'O atraso não pode ser negativo',
            'delayMessage.max' => 'O atraso não pode exceder 3600 segundos (1 hora)',
            'mentionEveryone.boolean' => 'A opção mencionar todos deve ser verdadeiro ou falso',
            'mentioned.array' => 'A lista de menções deve ser um array',
            'mentioned.*.regex' => 'Cada número mencionado deve estar no formato: 55 + DDD + telefone',
            'messageToReply.string' => 'O ID da mensagem de resposta deve ser uma string',
            'messageToReply.max' => 'O ID da mensagem de resposta não pode exceder 100 caracteres',
            'trackingId.max' => 'O ID de rastreamento não pode exceder 50 caracteres',
            'trackingId.regex' => 'O ID de rastreamento deve conter apenas letras, números, hífens e underscores',
        ];
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            'recipient' => 'número do destinatário',
            'text_message' => 'conteúdo da mensagem',
            'linkPreview' => 'prévia de link',
            'delayMessage' => 'atraso da mensagem',
            'mentionEveryone' => 'mencionar todos',
            'mentioned' => 'números mencionados',
            'messageToReply' => 'mensagem para responder',
            'trackingId' => 'ID de rastreamento',
        ];
    }
}
