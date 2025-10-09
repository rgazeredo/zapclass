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
             * Número do destinatário no formato internacional.
             * Deve incluir código do país DDI + DDD + número
             * @example "5511999999999"
             */
            'number' => 'required|string',

            /**
             * Conteúdo da mensagem de texto a ser enviada.
             * Suporta texto simples, emojis e caracteres especiais
             * @example "Olá! Bem-vindo à nossa plataforma ZapClass 🚀"
             */
            'message' => 'required|string',

            /**
             * Atraso em milissegundos antes do envio (agendamento).
             * Útil para envios programados ou intervalos entre mensagens.
             * Aparecerá "Digitando..." antes do envio.
             * @example 3000
             */
            'delay' => 'sometimes|integer',

            /**
             * Marca a mensagem como encaminhada para o destinatário.
             * @example true
             */
            'forward' => 'sometimes|boolean',

            /**
             * Controla se links na mensagem devem exibir prévia automática
             * true: exibe prévia, false: apenas o link
             * @example true
             */
            'link_preview' => 'sometimes|boolean',

            /**
             * Título personalizado para prévia de link
             * Se fornecido, será exibido como o título da prévia do link
             * @example "Confira este artigo incrível"
             */
            'link_preview_title' => 'sometimes|string',

            /**
             * Descrição personalizada para prévia de link
             * Se fornecido, será exibido como a descrição da prévia do link
             * @example "Confira este artigo incrível sobre programação"
             */
            'link_preview_description' => 'sometimes|string',

            /**
             * URL ou Base64da imagem personalizada para prévia de link
             * Se fornecido, será exibido como a imagem da prévia do link
             * @example "https://placehold.co/600x400.png"
             */
            'link_preview_image' => 'sometimes|string',

            /**
             * Controla se a prévia de link deve ser exibida em tamanho grande
             * true: exibe em tamanho grande, false: exibe em tamanho padrão
             * @example true
             */
            'link_preview_large' => 'sometimes|boolean',

            /**
             * Relação de números de telefone a serem mencionados na mensagem
             * String separada por vírgula de números de telefone para mencionar especificamente
             * @example "5511999999999,5511888888888"
             */
            'mentions' => 'sometimes|string',

            /**
             * Marca a conversa como lida após o envio.
             * @example true
             */
            'read' => 'sometimes|boolean',

            /**
             * Marca as últimas mensagens como lidas após o envio.
             * @example true
             */
            'read_messages' => 'sometimes|boolean',
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
