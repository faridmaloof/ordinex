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
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('numero_documento', 'like', "%{$search}%")
                  ->orWhere('razon_social', 'like', "%{$search}%")
                  ->orWhere('nombre_comercial', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === '1');
        }

        if ($request->filled('tipo_documento')) {
            $query->where('tipo_documento', $request->tipo_documento);
        }

        if ($request->filled('con_saldo')) {
            if ($request->con_saldo === '1') {
                $query->where('saldo_pendiente', '>', 0);
            } else {
                $query->where('saldo_pendiente', '=', 0);
            }
        }

        // Paginación dinámica
        $perPage = $request->get('per_page', 10);
        $clientes = $query->orderBy('razon_social')->paginate($perPage)->withQueryString();

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'activo', 'tipo_documento', 'con_saldo', 'per_page']),
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
            'codigo' => 'required|string|max:20|unique:cat__clientes,codigo',
            'tipo_documento' => 'required|in:NIT,CC,CE,Pasaporte',
            'numero_documento' => 'required|string|max:50',
            'razon_social' => 'required|string|max:200',
            'nombre_comercial' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'pais' => 'nullable|string|max:100',
            'limite_credito' => 'required|numeric|min:0',
            'dias_credito' => 'required|integer|min:0',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $validated['saldo_pendiente'] = 0;
        $validated['saldo_favor'] = 0;

        Cliente::create($validated);

        return redirect()->route('catalogos.clientes.index')
            ->with('success', 'Cliente creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Cliente $cliente): Response
    {
        $cliente->load(['solicitudes' => function ($query) {
            $query->latest()->limit(5);
        }, 'ordenesServicio' => function ($query) {
            $query->latest()->limit(5);
        }]);

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
            'codigo' => 'required|string|max:20|unique:cat__clientes,codigo,' . $cliente->id,
            'tipo_documento' => 'required|in:NIT,CC,CE,Pasaporte',
            'numero_documento' => 'required|string|max:50',
            'razon_social' => 'required|string|max:200',
            'nombre_comercial' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'pais' => 'nullable|string|max:100',
            'limite_credito' => 'required|numeric|min:0',
            'dias_credito' => 'required|integer|min:0',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

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

