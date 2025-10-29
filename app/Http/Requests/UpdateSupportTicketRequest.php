<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupportTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $ticket = $this->route('ticket');

        // Admin pode atualizar qualquer ticket
        if ($user->isAdmin()) {
            return true;
        }

        // Usuário pode atualizar apenas tickets do próprio tenant
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
            'status' => 'nullable|in:open,in_progress,waiting_customer,waiting_staff,resolved,closed',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'category_id' => 'nullable|exists:ticket_categories,id',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.in' => 'O status selecionado não é válido.',
            'priority.in' => 'A prioridade selecionada não é válida.',
            'category_id.exists' => 'A categoria selecionada não é válida.',
            'assigned_to.exists' => 'O usuário selecionado não é válido.',
        ];
    }
}
