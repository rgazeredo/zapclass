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
            'phone_number' => 'required|string|regex:/^55[1-9][0-9]{9,10}$/',
            'message' => 'required|string|min:1|max:4096',
            'connection_id' => 'sometimes|string', // Opcional, usa a conexão do token se não fornecido
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'phone_number.required' => 'O número de telefone é obrigatório',
            'phone_number.regex' => 'O número deve estar no formato brasileiro com DDI (ex: 5511999999999)',
            'message.required' => 'A mensagem é obrigatória',
            'message.min' => 'A mensagem deve ter pelo menos 1 caractere',
            'message.max' => 'A mensagem não pode ter mais que 4096 caracteres',
            'connection_id.string' => 'O ID da conexão deve ser uma string válida',
        ];
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            'phone_number' => 'número de telefone',
            'message' => 'mensagem',
            'connection_id' => 'ID da conexão',
        ];
    }
}
