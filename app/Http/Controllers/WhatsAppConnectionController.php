<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WhatsAppConnectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenant = Auth::user()->tenant;
        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $maxConnections = $tenant->whatsapp_connections;
        $currentConnections = $connections->count();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenant = Auth::user()->tenant;
        $currentConnections = WhatsAppConnection::where('tenant_id', $tenant->id)->count();
        $maxConnections = $tenant->whatsapp_connections;

        if ($currentConnections >= $maxConnections) {
            return redirect()->route('whatsapp.index')
                ->with('error', 'You have reached the maximum number of WhatsApp connections for your plan.');
        }

        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
            'modalType' => 'create',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = Auth::user()->tenant;
        $currentConnections = WhatsAppConnection::where('tenant_id', $tenant->id)->count();
        $maxConnections = $tenant->whatsapp_connections;

        if ($currentConnections >= $maxConnections) {
            return redirect()->route('whatsapp.index')
                ->with('error', 'You have reached the maximum number of WhatsApp connections for your plan.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'system_name' => 'required|string|max:255',
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        WhatsAppConnection::create([
            'tenant_id' => $tenant->id,
            'name' => $request->name,
            'system_name' => $request->system_name,
            'admin_field_1' => $request->admin_field_1,
            'admin_field_2' => $request->admin_field_2,
        ]);

        return redirect()->route('whatsapp.index')
            ->with('success', 'WhatsApp connection created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('WhatsApp/Show', [
            'connection' => $whatsapp,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $tenant = Auth::user()->tenant;
        $connections = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $maxConnections = $tenant->whatsapp_connections;
        $currentConnections = $connections->count();

        return Inertia::render('WhatsApp/Index', [
            'connections' => $connections,
            'maxConnections' => $maxConnections,
            'currentConnections' => $currentConnections,
            'canCreateMore' => $currentConnections < $maxConnections,
            'modalType' => 'edit',
            'editConnection' => $whatsapp,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'system_name' => 'required|string|max:255',
            'admin_field_1' => 'nullable|string|max:255',
            'admin_field_2' => 'nullable|string|max:255',
        ]);

        $whatsapp->update([
            'name' => $request->name,
            'system_name' => $request->system_name,
            'admin_field_1' => $request->admin_field_1,
            'admin_field_2' => $request->admin_field_2,
        ]);

        return redirect()->route('whatsapp.index')
            ->with('success', 'WhatsApp connection updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WhatsAppConnection $whatsapp)
    {
        // Verificar se a conexão pertence ao tenant do usuário
        if ($whatsapp->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $whatsapp->delete();

        return redirect()->route('whatsapp.index')
            ->with('success', 'WhatsApp connection deleted successfully.');
    }
}
