<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TicketCategory;
use App\Http\Requests\StoreSupportTicketRequest;
use App\Http\Requests\UpdateSupportTicketRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    /**
     * Display a listing of tickets.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = SupportTicket::with(['user', 'category', 'assignedTo'])
            ->orderBy('created_at', 'desc');

        // Se não for admin, mostrar apenas tickets do próprio tenant
        if (!$user->isAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', "%{$request->search}%")
                  ->orWhere('subject', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $tickets = $query->paginate(15)->withQueryString();

        $categories = TicketCategory::active()->get();

        return Inertia::render('Support/Tickets/Index', [
            'tickets' => $tickets,
            'categories' => $categories,
            'filters' => $request->only(['status', 'priority', 'category_id', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new ticket.
     */
    public function create(): Response
    {
        $categories = TicketCategory::active()->get();

        return Inertia::render('Support/Tickets/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(StoreSupportTicketRequest $request)
    {
        $validated = $request->validated();

        $user = Auth::user();

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'category_id' => $validated['category_id'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
        ]);

        return redirect()->route('support.tickets.show', $ticket)
            ->with('success', 'Ticket criado com sucesso!');
    }

    /**
     * Display the specified ticket.
     */
    public function show(SupportTicket $ticket): Response
    {
        $user = Auth::user();

        // Verificar permissões
        if (!$user->isAdmin() && $ticket->tenant_id !== $user->tenant_id) {
            abort(403, 'Você não tem permissão para acessar este ticket.');
        }

        $ticket->load([
            'user',
            'tenant',
            'category',
            'assignedTo',
            'messages.user',
        ]);

        // Se for admin, carregar lista de admins para atribuição
        $admins = null;
        if ($user->isAdmin()) {
            $admins = \App\Models\User::where('role', 'admin')
                ->select('id', 'name', 'email')
                ->get();
        }

        return Inertia::render('Support/Tickets/Show', [
            'ticket' => $ticket,
            'admins' => $admins,
        ]);
    }

    /**
     * Update the specified ticket.
     */
    public function update(UpdateSupportTicketRequest $request, SupportTicket $ticket)
    {
        $user = Auth::user();

        $validated = $request->validated();

        // Apenas admins podem alterar assigned_to
        if (!$user->isAdmin()) {
            unset($validated['assigned_to']);
        }

        // Atualizar timestamps especiais
        if (isset($validated['status'])) {
            if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
                $validated['resolved_at'] = now();
            } elseif ($validated['status'] === 'closed' && !$ticket->closed_at) {
                $validated['closed_at'] = now();
            }
        }

        $ticket->update($validated);

        return back()->with('success', 'Ticket atualizado com sucesso!');
    }

    /**
     * Remove the specified ticket.
     */
    public function destroy(SupportTicket $ticket)
    {
        $user = Auth::user();

        // Apenas admins ou o criador do ticket podem deletar
        if (!$user->isAdmin() && $ticket->user_id !== $user->id) {
            abort(403, 'Você não tem permissão para deletar este ticket.');
        }

        $ticket->delete();

        return redirect()->route('support.tickets.index')
            ->with('success', 'Ticket deletado com sucesso!');
    }

    /**
     * Assign ticket to an admin.
     */
    public function assign(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Apenas administradores podem atribuir tickets.');
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'in_progress',
        ]);

        return back()->with('success', 'Ticket atribuído com sucesso!');
    }
}
