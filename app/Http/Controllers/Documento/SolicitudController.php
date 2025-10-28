<?php

namespace App\Http\Controllers\Documento;

use App\Http\Controllers\Controller;
use App\Models\Documento\Solicitud;
use App\Models\Catalogo\Cliente;
use App\Models\Catalogo\Item;
use App\Services\SolicitudService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SolicitudController extends Controller
{
    public function __construct(
        protected SolicitudService $solicitudService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Solicitud::with(['cliente', 'usuarioCrea'])
            ->orderBy('fecha', 'desc');

        // Filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhereHas('cliente', function ($q2) use ($search) {
                        $q2->where('razon_social', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        $solicitudes = $query->paginate(15)->withQueryString();

        return Inertia::render('Documento/Solicitud/Index', [
            'solicitudes' => $solicitudes,
            'filters' => $request->only(['search', 'estado', 'fecha_desde', 'fecha_hasta']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clientes = Cliente::activos()->orderBy('razon_social')->get();
        $items = Item::activos()->orderBy('nombre')->get();

        return Inertia::render('Documento/Solicitud/Create', [
            'clientes' => $clientes,
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:cat__clientes,id',
            'fecha' => 'nullable|date',
            'fecha_entrega_estimada' => 'nullable|date|after_or_equal:fecha',
            'observaciones' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:cat__items,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento' => 'nullable|numeric|min:0|max:100',
            'items.*.observaciones' => 'nullable|string|max:500',
        ]);

        $solicitud = $this->solicitudService->crear($validated);

        return redirect()
            ->route('documentos.solicitudes.show', $solicitud)
            ->with('success', 'Solicitud creada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Solicitud $solicitud)
    {
        $solicitud->load([
            'cliente',
            'items.item',
            'usuarioCrea',
            'usuarioAutoriza',
            'ordenesServicio',
        ]);

        return Inertia::render('Documento/Solicitud/Show', [
            'solicitud' => $solicitud,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Solicitud $solicitud)
    {
        // Solo permitir editar si está en borrador o pendiente
        if (!in_array($solicitud->estado, ['borrador', 'pendiente'])) {
            return back()->with('error', 'No se puede editar una solicitud ' . $solicitud->estado);
        }

        $solicitud->load('items.item');
        $clientes = Cliente::activos()->orderBy('razon_social')->get();
        $items = Item::activos()->orderBy('nombre')->get();

        return Inertia::render('Documento/Solicitud/Edit', [
            'solicitud' => $solicitud,
            'clientes' => $clientes,
            'items' => $items,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:cat__clientes,id',
            'fecha' => 'nullable|date',
            'fecha_entrega_estimada' => 'nullable|date|after_or_equal:fecha',
            'observaciones' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:cat__items,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento' => 'nullable|numeric|min:0|max:100',
            'items.*.observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $this->solicitudService->actualizar($solicitud->id, $validated);

            return redirect()
                ->route('documentos.solicitudes.show', $solicitud)
                ->with('success', 'Solicitud actualizada exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitud $solicitud)
    {
        // Solo permitir eliminar si está en borrador
        if ($solicitud->estado !== 'borrador') {
            return back()->with('error', 'Solo se pueden eliminar solicitudes en borrador');
        }

        // Verificar que no tenga órdenes de servicio
        if ($solicitud->ordenesServicio()->exists()) {
            return back()->with('error', 'No se puede eliminar una solicitud con órdenes de servicio asociadas');
        }

        $solicitud->delete();

        return redirect()
            ->route('documentos.solicitudes.index')
            ->with('success', 'Solicitud eliminada exitosamente');
    }

    /**
     * Enviar solicitud a autorización
     */
    public function enviarAutorizacion(Solicitud $solicitud)
    {
        try {
            $this->solicitudService->enviarAutorizacion($solicitud->id);

            return back()->with('success', 'Solicitud enviada a autorización');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Autorizar solicitud
     */
    public function autorizar(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->solicitudService->autorizar(
                $solicitud->id,
                $user->id,
                $validated['observaciones'] ?? null
            );

            return back()->with('success', 'Solicitud autorizada exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Rechazar solicitud
     */
    public function rechazar(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'motivo_rechazo' => 'required|string|max:500',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->solicitudService->rechazar(
                $solicitud->id,
                $user->id,
                $validated['motivo_rechazo']
            );

            return back()->with('success', 'Solicitud rechazada');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
