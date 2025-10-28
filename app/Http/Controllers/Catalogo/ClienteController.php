<?php

namespace App\Http\Controllers\Catalogo;

use App\Http\Controllers\Controller;
use App\Models\Catalogo\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Cliente::query();

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === '1');
        }

        if ($request->filled('tipo_cliente')) {
            $query->where('tipo_cliente', $request->tipo_cliente);
        }

        if ($request->filled('tipo_documento')) {
            $query->where('tipo_documento', $request->tipo_documento);
        }

        if ($request->filled('con_saldo_favor')) {
            if ($request->con_saldo_favor === '1') {
                $query->where('saldo_favor', '>', 0);
            }
        }

        // Paginación dinámica
        $perPage = $request->get('per_page', 10);
        $clientes = $query->with('vendedor:id,nombre')->orderBy('nombre')->paginate($perPage)->withQueryString();

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'activo', 'tipo_cliente', 'tipo_documento', 'con_saldo_favor', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Clientes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'erp_id' => 'nullable|string|max:50|unique:cat__clientes,erp_id',
            'tipo_cliente' => 'required|in:natural,juridico',
            'tipo_documento' => 'required|in:CC,NIT,CE,Pasaporte',
            'numero_documento' => 'required|string|max:20|unique:cat__clientes,numero_documento',
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'vendedor_id' => 'nullable|exists:users,id',
            'limite_credito' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $validated['saldo_favor'] = 0;
        $validated['sincronizado_erp'] = !empty($validated['erp_id']);

        Cliente::create($validated);

        return redirect()->route('catalogos.clientes.index')
            ->with('success', 'Cliente creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Cliente $cliente): Response
    {
        $cliente->load([
            'vendedor:id,nombre',
            'solicitudes' => function ($query) {
                $query->latest()->limit(5);
            },
            'ordenesServicio' => function ($query) {
                $query->latest()->limit(5);
            }
        ]);

        return Inertia::render('Clientes/Show', [
            'cliente' => $cliente,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('Clientes/Edit', [
            'cliente' => $cliente,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'erp_id' => 'nullable|string|max:50|unique:cat__clientes,erp_id,' . $cliente->id,
            'tipo_cliente' => 'required|in:natural,juridico',
            'tipo_documento' => 'required|in:CC,NIT,CE,Pasaporte',
            'numero_documento' => 'required|string|max:20|unique:cat__clientes,numero_documento,' . $cliente->id,
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'vendedor_id' => 'nullable|exists:users,id',
            'limite_credito' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $validated['sincronizado_erp'] = !empty($validated['erp_id']);

        $cliente->update($validated);

        return redirect()->route('catalogos.clientes.show', $cliente)
            ->with('success', 'Cliente actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cliente $cliente)
    {
        // Verificar que no tenga transacciones
        if ($cliente->solicitudes()->count() > 0) {
            return back()->withErrors(['error' => 'No se puede eliminar un cliente con transacciones']);
        }

        $cliente->delete();

        return redirect()->route('catalogos.clientes.index')
            ->with('success', 'Cliente eliminado exitosamente');
    }
}

