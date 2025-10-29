<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $ticket = $this->route('ticket');

        // Admin pode responder qualquer ticket
        if ($user->isAdmin()) {
            return true;
        }

        // Usuário pode responder apenas tickets do próprio tenant
        return $ticket && $ticket->tenant_id === $user->tenant_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => 'required|string|min:3',
            'is_internal' => 'nullable|boolean',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt,zip',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'A mensagem é obrigatória.',
            'message.min' => 'A mensagem deve ter pelo menos 3 caracteres.',
            'attachments.max' => 'Você pode enviar no máximo 5 anexos.',
            'attachments.*.file' => 'Um dos arquivos enviados não é válido.',
            'attachments.*.max' => 'Cada arquivo deve ter no máximo 10MB.',
            'attachments.*.mimes' => 'Tipo de arquivo não permitido. Permitidos: jpg, jpeg, png, pdf, doc, docx, txt, zip',
        ];
    }
}
