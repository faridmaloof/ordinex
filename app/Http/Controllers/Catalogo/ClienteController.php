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
        $query = Cliente::query()->with(['solicitudes', 'ordenesServicio']);

        // Filtros
        if ($request->filled('buscar')) {
            $query->buscar($request->buscar);
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        $clientes = $query->orderBy('razon_social')->paginate(15)->withQueryString();

        return Inertia::render('Catalogo/Cliente/Index', [
            'clientes' => $clientes,
            'filtros' => $request->only(['buscar', 'activo']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Catalogo/Cliente/Create');
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

        return redirect()->route('catalogo.clientes.index')
            ->with('success', 'Cliente creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Cliente $cliente): Response
    {
        $cliente->load(['solicitudes', 'ordenesServicio', 'pagos']);

        return Inertia::render('Catalogo/Cliente/Show', [
            'cliente' => $cliente,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('Catalogo/Cliente/Edit', [
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

        return redirect()->route('catalogo.clientes.show', $cliente)
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

        return redirect()->route('catalogo.clientes.index')
            ->with('success', 'Cliente eliminado exitosamente');
    }
}

