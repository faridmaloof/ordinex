<?php

namespace App\Http\Controllers;

use App\Models\Documento\Solicitud;
use App\Models\Catalogo\Cliente;
use App\Models\Catalogo\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SolicitudController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Solicitud::with(['cliente', 'usuarioCrea', 'usuarioAutoriza'])
            ->withCount('items');

        // Filtros
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
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

        $solicitudes = $query->paginate($request->get('per_page', 10));

        return Inertia::render('Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'filters' => $request->only(['estado', 'cliente_id', 'fecha_desde', 'fecha_hasta', 'search']),
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(['id', 'razon_social', 'nombre_comercial']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Solicitudes/Create', [
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(),
            'items' => Item::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:cat__clientes,id',
            'fecha' => 'required|date',
            'fecha_entrega_estimada' => 'required|date|after_or_equal:fecha',
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
            $iva = $baseImponible * 0.13; // 13% IVA
            $total = $baseImponible + $iva;

            // Generar número
            $ultimaSolicitud = Solicitud::orderBy('id', 'desc')->first();
            $numero = $ultimaSolicitud ? 'SOL-' . str_pad($ultimaSolicitud->id + 1, 6, '0', STR_PAD_LEFT) : 'SOL-000001';

            // Crear solicitud
            $solicitud = Solicitud::create([
                'numero' => $numero,
                'cliente_id' => $validated['cliente_id'],
                'fecha' => $validated['fecha'],
                'fecha_entrega_estimada' => $validated['fecha_entrega_estimada'],
                'estado' => 'borrador',
                'usuario_crea_id' => auth()->id(),
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'iva' => $iva,
                'total' => $total,
                'observaciones' => $validated['observaciones'] ?? null,
                'requiere_autorizacion' => $total > 10000, // Ejemplo: más de 10000 requiere autorización
            ]);

            // Crear items
            foreach ($validated['items'] as $itemData) {
                $solicitud->items()->create($itemData);
            }

            DB::commit();

            return redirect()->route('documentos.solicitudes.show', $solicitud)
                ->with('success', 'Solicitud creada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la solicitud: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Solicitud $solicitud)
    {
        $solicitud->load(['cliente', 'usuarioCrea', 'usuarioAutoriza', 'items.item', 'ordenServicio']);

        return Inertia::render('Solicitudes/Show', [
            'solicitud' => $solicitud,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'borrador') {
            return back()->withErrors(['error' => 'Solo se pueden editar solicitudes en estado borrador']);
        }

        $solicitud->load(['items']);

        return Inertia::render('Solicitudes/Edit', [
            'solicitud' => $solicitud,
            'clientes' => Cliente::where('activo', true)->orderBy('razon_social')->get(),
            'items' => Item::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'borrador') {
            return back()->withErrors(['error' => 'Solo se pueden editar solicitudes en estado borrador']);
        }

        $validated = $request->validate([
            'cliente_id' => 'required|exists:cat__clientes,id',
            'fecha' => 'required|date',
            'fecha_entrega_estimada' => 'required|date|after_or_equal:fecha',
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

            // Actualizar solicitud
            $solicitud->update([
                'cliente_id' => $validated['cliente_id'],
                'fecha' => $validated['fecha'],
                'fecha_entrega_estimada' => $validated['fecha_entrega_estimada'],
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'iva' => $iva,
                'total' => $total,
                'observaciones' => $validated['observaciones'] ?? null,
                'requiere_autorizacion' => $total > 10000,
            ]);

            // Eliminar items anteriores y crear nuevos
            $solicitud->items()->delete();
            foreach ($validated['items'] as $itemData) {
                $solicitud->items()->create($itemData);
            }

            DB::commit();

            return redirect()->route('documentos.solicitudes.show', $solicitud)
                ->with('success', 'Solicitud actualizada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar la solicitud: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'borrador') {
            return back()->withErrors(['error' => 'Solo se pueden eliminar solicitudes en estado borrador']);
        }

        if ($solicitud->ordenServicio) {
            return back()->withErrors(['error' => 'No se puede eliminar una solicitud con orden de servicio asociada']);
        }

        DB::beginTransaction();
        try {
            $solicitud->items()->delete();
            $solicitud->delete();

            DB::commit();

            return redirect()->route('documentos.solicitudes.index')
                ->with('success', 'Solicitud eliminada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al eliminar la solicitud: ' . $e->getMessage()]);
        }
    }

    /**
     * Autorizar solicitud
     */
    public function autorizar(Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'pendiente_autorizacion') {
            return back()->withErrors(['error' => 'Solo se pueden autorizar solicitudes pendientes de autorización']);
        }

        DB::beginTransaction();
        try {
            $solicitud->update([
                'estado' => 'autorizada',
                'usuario_autoriza_id' => auth()->id(),
                'fecha_autorizacion' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Solicitud autorizada exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al autorizar la solicitud: ' . $e->getMessage()]);
        }
    }

    /**
     * Rechazar solicitud
     */
    public function rechazar(Request $request, Solicitud $solicitud)
    {
        $request->validate([
            'motivo' => 'required|string|min:10',
        ]);

        if ($solicitud->estado !== 'pendiente_autorizacion') {
            return back()->withErrors(['error' => 'Solo se pueden rechazar solicitudes pendientes de autorización']);
        }

        DB::beginTransaction();
        try {
            $solicitud->update([
                'estado' => 'rechazada',
                'observaciones' => ($solicitud->observaciones ? $solicitud->observaciones . "\n\n" : '') 
                    . "RECHAZADA: " . $request->motivo . " (por " . auth()->user()->name . " el " . now()->format('d/m/Y H:i') . ")",
            ]);

            DB::commit();

            return back()->with('success', 'Solicitud rechazada');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al rechazar la solicitud: ' . $e->getMessage()]);
        }
    }
}
