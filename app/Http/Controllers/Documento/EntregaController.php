<?php

namespace App\Http\Controllers\Documento;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documento\StoreEntregaRequest;
use App\Http\Requests\Documento\UpdateEntregaRequest;
use App\Models\Documento\Entrega;
use App\Models\Documento\OrdenServicio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EntregaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Entrega::with(['cliente', 'ordenServicio']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('numero', 'like', "%{$search}%")
                ->orWhere('estado', 'like', "%{$search}%")
                ->orWhereHas('cliente', fn ($q) => $q->where('nombre', 'like', "%{$search}%"));
        }

        $entregas = $query->latest('fecha_preparacion')->paginate(15)->withQueryString();

        return Inertia::render('Documento/Entregas/Index', [
            'entregas' => $entregas,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $orden = OrdenServicio::findOrFail($request->input('orden_servicio_id'));
        // You would probably pass more data from the order to the view
        return Inertia::render('Documento/Entregas/Create', [
            'orden' => $orden,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEntregaRequest $request): RedirectResponse
    {
        $orden = OrdenServicio::with('solicitud')->findOrFail($request->input('orden_servicio_id'));

        // Basic logic to create a delivery from an order.
        // A real-world scenario might involve a dedicated service class.
        $entrega = Entrega::create([
            'numero' => 'ENT-' . time(), // Simplified number generation
            'orden_servicio_id' => $orden->id,
            'solicitud_id' => $orden->solicitud_id,
            'cliente_id' => $orden->cliente_id,
            'usuario_prepara_id' => Auth::id(),
            'fecha_preparacion' => $request->input('fecha_preparacion'),
            'estado' => 'pendiente_pago', // Initial state
            // Assuming totals are copied from the source document (solicitud in this case)
            'subtotal' => $orden->solicitud->subtotal ?? 0,
            'descuento' => $orden->solicitud->descuento ?? 0,
            'iva' => $orden->solicitud->iva ?? 0,
            'total' => $orden->solicitud->total ?? 0,
            'saldo_pendiente' => $orden->solicitud->total ?? 0, // Initially, the full amount is pending
            'observaciones' => $request->input('observaciones'),
        ]);

        return redirect()->route('entregas.show', $entrega)->with('success', 'Entrega creada con éxito.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Entrega $entrega): Response
    {
        $entrega->load(['cliente', 'ordenServicio.solicitud', 'usuarioPrepara', 'usuarioEntrega']);
        // You would also load related payments here

        return Inertia::render('Documento/Entregas/Show', [
            'entrega' => $entrega,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Entrega $entrega): Response
    {
        return Inertia::render('Documento/Entregas/Edit', [
            'entrega' => $entrega,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEntregaRequest $request, Entrega $entrega): RedirectResponse
    {
        $validated = $request->validated();

        if ($validated['estado'] === 'entregada') {
            $validated['fecha_entrega'] = now();
            $validated['usuario_entrega_id'] = $validated['usuario_entrega_id'] ?? Auth::id();
        }

        $entrega->update($validated);

        return redirect()->route('entregas.show', $entrega)->with('success', 'Entrega actualizada con éxito.');
    }

    /**
     * Annul the specified resource from storage.
     */
    public function destroy(Entrega $entrega): RedirectResponse
    {
        // This does not delete the record, but marks it as annulled.
        // You might need to add logic to revert stock or other related data.
        if ($entrega->estado === 'anulada') {
            return redirect()->back()->with('error', 'Esta entrega ya ha sido anulada.');
        }

        if ($entrega->total_pagado > 0) {
            return redirect()->back()->with('error', 'No se puede anular una entrega que tiene pagos registrados.');
        }

        $entrega->update([
            'estado' => 'anulada',
        ]);

        return redirect()->route('entregas.index')->with('success', 'La entrega ha sido anulada.');
    }
}