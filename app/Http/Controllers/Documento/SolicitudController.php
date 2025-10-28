<?php

namespace App\Http\Controllers\Documento;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documento\AutorizarSolicitudRequest;
use App\Http\Requests\Documento\RechazarSolicitudRequest;
use App\Http\Requests\Documento\StoreSolicitudRequest;
use App\Http\Requests\Documento\UpdateSolicitudRequest;
use App\Models\Catalogo\Cliente;
use App\Models\Catalogo\Item;
use App\Models\Documento\Solicitud;
use App\Services\SolicitudService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SolicitudController extends Controller
{
    public function __construct(
        protected SolicitudService $solicitudService
    ) {}

    public function index(Request $request)
    {
        $query = Solicitud::with(['cliente', 'usuarioCrea'])->orderBy('fecha', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhereHas('cliente', fn ($q2) => $q2->where('razon_social', 'like', "%{$search}%"));
            });
        }
        // ... other filters

        $solicitudes = $query->paginate(15)->withQueryString();

        return Inertia::render('Documento/Solicitud/Index', [
            'solicitudes' => $solicitudes,
            'filters' => $request->only(['search', 'estado', 'fecha_desde', 'fecha_hasta']),
        ]);
    }

    public function create()
    {
        $clientes = Cliente::activos()->orderBy('razon_social')->get();
        $items = Item::activos()->orderBy('nombre')->get();

        return Inertia::render('Documento/Solicitud/Create', [
            'clientes' => $clientes,
            'items' => $items,
        ]);
    }

    public function store(StoreSolicitudRequest $request)
    {
        $solicitud = $this->solicitudService->crear($request->validated());
        return redirect()->route('solicitudes.show', $solicitud)->with('success', 'Solicitud creada exitosamente');
    }

    public function show(Solicitud $solicitud)
    {
        $solicitud->load(['cliente', 'items.item', 'usuarioCrea', 'usuarioAutoriza', 'ordenesServicio']);
        return Inertia::render('Documento/Solicitud/Show', ['solicitud' => $solicitud]);
    }

    public function edit(Solicitud $solicitud)
    {
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

    public function update(UpdateSolicitudRequest $request, Solicitud $solicitud)
    {
        try {
            $this->solicitudService->actualizar($solicitud->id, $request->validated());
            return redirect()->route('solicitudes.show', $solicitud)->with('success', 'Solicitud actualizada exitosamente');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function destroy(Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'borrador') {
            return back()->with('error', 'Solo se pueden eliminar solicitudes en borrador');
        }
        if ($solicitud->ordenesServicio()->exists()) {
            return back()->with('error', 'No se puede eliminar una solicitud con órdenes de servicio asociadas');
        }

        $solicitud->delete();
        return redirect()->route('solicitudes.index')->with('success', 'Solicitud eliminada exitosamente');
    }

    public function enviarAutorizacion(Solicitud $solicitud)
    {
        try {
            $this->solicitudService->enviarAutorizacion($solicitud->id);
            return back()->with('success', 'Solicitud enviada a autorización');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function autorizar(AutorizarSolicitudRequest $request, Solicitud $solicitud)
    {
        try {
            $this->solicitudService->autorizar(
                $solicitud->id,
                Auth::id(),
                $request->validated()['observaciones'] ?? null
            );
            return back()->with('success', 'Solicitud autorizada exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function rechazar(RechazarSolicitudRequest $request, Solicitud $solicitud)
    {
        try {
            $this->solicitudService->rechazar(
                $solicitud->id,
                Auth::id(),
                $request->validated()['motivo_rechazo']
            );
            return back()->with('success', 'Solicitud rechazada');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}