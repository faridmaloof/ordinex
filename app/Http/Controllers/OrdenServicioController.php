<?php

namespace App\Http\Controllers;

use App\Models\Documento\OrdenServicio;
use App\Models\Documento\Solicitud;
use App\Models\Catalogo\Cliente;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrdenServicioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = OrdenServicio::with(['cliente', 'tecnicoAsignado', 'usuarioCrea', 'solicitud'])
            ->withCount('items');

        // Filtros
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->prioridad);
        }

        if ($request->filled('tecnico_asignado_id')) {
            $query->where('tecnico_asignado_id', $request->tecnico_asignado_id);
        }

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('cliente', function ($q) use ($search) {
                        $q->where('razon_social', 'like', "%{$search}%")
                            ->orWhere('nombre_comercial', 'like', "%{$search}%");
                    });
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $ordenes = $query->paginate($request->get('per_page', 10));

        return Inertia::render('Ordenes/Index', [
            'ordenes' => $ordenes,
            'filters' => $request->only(['estado', 'prioridad', 'tecnico_asignado_id', 'cliente_id', 'fecha_desde', 'fecha_hasta', 'search']),
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(['id', 'razon_social']),
            'tecnicos' => User::whereHas('rol', function ($q) {
                $q->where('nombre', 'Técnico');
            })->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $solicitud = null;
        if ($request->filled('solicitud_id')) {
            $solicitud = Solicitud::with(['cliente', 'items.item'])->findOrFail($request->solicitud_id);
        }

        return Inertia::render('Ordenes/Create', [
            'solicitud' => $solicitud,
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(),
            'tecnicos' => User::whereHas('rol', function ($q) {
                $q->where('nombre', 'Técnico');
            })->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'solicitud_id' => 'nullable|exists:doc__solicitudes,id',
            'cliente_id' => 'required|exists:cat__clientes,id',
            'fecha' => 'required|date',
            'fecha_fin_estimada' => 'required|date|after_or_equal:fecha',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'tecnico_asignado_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:cat__items,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento' => 'nullable|numeric|min:0|max:100',
            'observaciones' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Calcular totales
            $subtotal = 0;
            $descuentoTotal = 0;
            
            foreach ($validated['items'] as $item) {
                $subtotalItem = $item['cantidad'] * $item['precio_unitario'];
                $descuentoItem = $subtotalItem * (($item['descuento'] ?? 0) / 100);
                $subtotal += $subtotalItem;
                $descuentoTotal += $descuentoItem;
            }

            $baseImponible = $subtotal - $descuentoTotal;
            $iva = $baseImponible * 0.13;
            $total = $baseImponible + $iva;

            // Generar número
            $ultimaOrden = OrdenServicio::orderBy('id', 'desc')->first();
            $numero = $ultimaOrden ? 'ORD-' . str_pad($ultimaOrden->id + 1, 6, '0', STR_PAD_LEFT) : 'ORD-000001';

            // Crear orden
            $orden = OrdenServicio::create([
                'numero' => $numero,
                'solicitud_id' => $validated['solicitud_id'] ?? null,
                'cliente_id' => $validated['cliente_id'],
                'fecha' => $validated['fecha'],
                'fecha_fin_estimada' => $validated['fecha_fin_estimada'],
                'estado' => 'pendiente',
                'prioridad' => $validated['prioridad'],
                'tecnico_asignado_id' => $validated['tecnico_asignado_id'],
                'usuario_crea_id' => auth()->id(),
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'iva' => $iva,
                'total' => $total,
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // Crear items
            foreach ($validated['items'] as $itemData) {
                $orden->items()->create($itemData);
            }

            // Registrar en historial
            $orden->historial()->create([
                'estado_anterior' => null,
                'estado_nuevo' => 'pendiente',
                'usuario_id' => auth()->id(),
                'observaciones' => 'Orden creada',
            ]);

            DB::commit();

            return redirect()->route('documentos.ordenes.show', $orden)
                ->with('success', 'Orden de servicio creada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(OrdenServicio $orden)
    {
        $orden->load([
            'cliente', 
            'tecnicoAsignado', 
            'usuarioCrea', 
            'solicitud',
            'items.item',
            'historial.usuario'
        ]);

        return Inertia::render('Ordenes/Show', [
            'orden' => $orden,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OrdenServicio $orden)
    {
        if (!in_array($orden->estado, ['pendiente', 'en_proceso'])) {
            return back()->withErrors(['error' => 'Solo se pueden editar órdenes pendientes o en proceso']);
        }

        $orden->load(['items']);

        return Inertia::render('Ordenes/Edit', [
            'orden' => $orden,
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(),
            'tecnicos' => User::whereHas('rol', function ($q) {
                $q->where('nombre', 'Técnico');
            })->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OrdenServicio $orden)
    {
        if (!in_array($orden->estado, ['pendiente', 'en_proceso'])) {
            return back()->withErrors(['error' => 'Solo se pueden editar órdenes pendientes o en proceso']);
        }

        $validated = $request->validate([
            'fecha_fin_estimada' => 'required|date',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'tecnico_asignado_id' => 'required|exists:users,id',
            'observaciones' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $orden->update($validated);

            DB::commit();

            return redirect()->route('documentos.ordenes.show', $orden)
                ->with('success', 'Orden actualizada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrdenServicio $orden)
    {
        if ($orden->estado !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden eliminar órdenes pendientes']);
        }

        DB::beginTransaction();
        try {
            $orden->items()->delete();
            $orden->historial()->delete();
            $orden->delete();

            DB::commit();

            return redirect()->route('documentos.ordenes.index')
                ->with('success', 'Orden eliminada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al eliminar la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Iniciar orden de servicio
     */
    public function iniciar(OrdenServicio $orden)
    {
        if ($orden->estado !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden iniciar órdenes pendientes']);
        }

        DB::beginTransaction();
        try {
            $orden->update([
                'estado' => 'en_proceso',
                'fecha_inicio' => now(),
            ]);

            $orden->historial()->create([
                'estado_anterior' => 'pendiente',
                'estado_nuevo' => 'en_proceso',
                'usuario_id' => auth()->id(),
                'observaciones' => 'Orden iniciada',
            ]);

            DB::commit();

            return back()->with('success', 'Orden iniciada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al iniciar la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Completar orden de servicio
     */
    public function completar(Request $request, OrdenServicio $orden)
    {
        $request->validate([
            'observaciones' => 'nullable|string',
        ]);

        if ($orden->estado !== 'en_proceso') {
            return back()->withErrors(['error' => 'Solo se pueden completar órdenes en proceso']);
        }

        DB::beginTransaction();
        try {
            $orden->update([
                'estado' => 'completada',
                'fecha_fin_real' => now(),
                'observaciones' => $orden->observaciones 
                    ? $orden->observaciones . "\n\n" . ($request->observaciones ?? '')
                    : ($request->observaciones ?? ''),
            ]);

            $orden->historial()->create([
                'estado_anterior' => 'en_proceso',
                'estado_nuevo' => 'completada',
                'usuario_id' => auth()->id(),
                'observaciones' => $request->observaciones ?? 'Trabajo completado',
            ]);

            DB::commit();

            return back()->with('success', 'Orden completada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al completar la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Entregar orden de servicio
     */
    public function entregar(OrdenServicio $orden)
    {
        if ($orden->estado !== 'completada') {
            return back()->withErrors(['error' => 'Solo se pueden entregar órdenes completadas']);
        }

        DB::beginTransaction();
        try {
            $orden->update([
                'estado' => 'entregada',
            ]);

            $orden->historial()->create([
                'estado_anterior' => 'completada',
                'estado_nuevo' => 'entregada',
                'usuario_id' => auth()->id(),
                'observaciones' => 'Orden entregada al cliente',
            ]);

            DB::commit();

            return back()->with('success', 'Orden entregada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al entregar la orden: ' . $e->getMessage()]);
        }
    }
}
