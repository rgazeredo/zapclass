<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Http\Requests\StoreTicketMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TicketMessageController extends Controller
{
    /**
     * Store a new message in a ticket.
     */
    public function store(StoreTicketMessageRequest $request, SupportTicket $ticket)
    {
        $user = Auth::user();

        $validated = $request->validated();

        // Processar anexos se houver
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('ticket-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
        }

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_internal' => $validated['is_internal'] ?? false,
            'attachments' => !empty($attachments) ? $attachments : null,
        ]);

        // Atualizar first_response_at se for a primeira resposta de um admin
        if ($user->isAdmin() && !$ticket->first_response_at) {
            $ticket->update([
                'first_response_at' => now(),
            ]);
        }

        // Atualizar status do ticket se necessário
        if ($user->isAdmin() && $ticket->status === 'waiting_staff') {
            $ticket->update(['status' => 'waiting_customer']);
        } elseif (!$user->isAdmin() && $ticket->status === 'waiting_customer') {
            $ticket->update(['status' => 'waiting_staff']);
        }

        return back()->with('success', 'Mensagem enviada com sucesso!');
    }

    /**
     * Update a message (only the author can update).
     */
    public function update(Request $request, TicketMessage $message)
    {
        $user = Auth::user();

        // Apenas o autor pode editar
        if ($message->user_id !== $user->id) {
            abort(403, 'Você não pode editar esta mensagem.');
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $message->update([
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Mensagem atualizada com sucesso!');
    }

    /**
     * Delete a message.
     */
    public function destroy(TicketMessage $message)
    {
        $user = Auth::user();

        // Apenas o autor ou admin pode deletar
        if ($message->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Você não pode deletar esta mensagem.');
        }

        // Deletar anexos se houver
        if ($message->attachments) {
            foreach ($message->attachments as $attachment) {
                Storage::disk('public')->delete($attachment['path']);
            }
        }

        $message->delete();

        return back()->with('success', 'Mensagem deletada com sucesso!');
    }

    /**
     * Download an attachment.
     */
    public function downloadAttachment(TicketMessage $message, $index)
    {
        $user = Auth::user();
        $ticket = $message->ticket;

        // Verificar permissões
        if (!$user->isAdmin() && $ticket->tenant_id !== $user->tenant_id) {
            abort(403, 'Você não tem permissão para acessar este anexo.');
        }

        if (!$message->attachments || !isset($message->attachments[$index])) {
            abort(404, 'Anexo não encontrado.');
        }

        $attachment = $message->attachments[$index];

        return Storage::disk('public')->download($attachment['path'], $attachment['name']);
    }
}
