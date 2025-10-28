<?php

namespace App\Http\Controllers\Documento;

use App\Http\Controllers\Controller;
use App\Models\Documento\OrdenServicio;
use App\Models\User;
use App\Services\OrdenServicioService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrdenServicioController extends Controller
{
    public function __construct(
        protected OrdenServicioService $ordenServicioService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = OrdenServicio::with(['cliente', 'solicitud', 'tecnicoAsignado'])
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

        if ($request->filled('tecnico_id')) {
            $query->where('tecnico_asignado_id', $request->tecnico_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->paginate(15)->withQueryString();
        $tecnicos = User::whereHas('rol', function ($q) {
            $q->where('nombre', 'Técnico');
        })->orderBy('name')->get();

        return Inertia::render('Documento/OrdenServicio/Index', [
            'ordenes' => $ordenes,
            'tecnicos' => $tecnicos,
            'filters' => $request->only(['search', 'estado', 'tecnico_id', 'fecha_desde', 'fecha_hasta']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(OrdenServicio $ordenServicio)
    {
        $ordenServicio->load([
            'cliente',
            'solicitud',
            'items.item',
            'tecnicoAsignado',
            'usuarioCrea',
            'pagos.formaPago',
            'entrega',
            'historial.usuario',
        ]);

        return Inertia::render('Documento/OrdenServicio/Show', [
            'orden' => $ordenServicio,
        ]);
    }

    /**
     * Asignar técnico a la orden
     */
    public function asignarTecnico(Request $request, OrdenServicio $ordenServicio)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|exists:users,id',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->ordenServicioService->asignarTecnico(
                $ordenServicio->id,
                $validated['tecnico_id'],
                $user->id
            );

            return back()->with('success', 'Técnico asignado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Iniciar trabajo en la orden
     */
    public function iniciar(OrdenServicio $ordenServicio)
    {
        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->ordenServicioService->iniciar($ordenServicio->id, $user->id);

            return back()->with('success', 'Orden iniciada exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Completar la orden
     */
    public function completar(Request $request, OrdenServicio $ordenServicio)
    {
        $validated = $request->validate([
            'observaciones' => 'nullable|string|max:1000',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->ordenServicioService->completar(
                $ordenServicio->id,
                $user->id,
                $validated['observaciones'] ?? null
            );

            return back()->with('success', 'Orden completada exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Generar entrega para la orden
     */
    public function entregar(Request $request, OrdenServicio $ordenServicio)
    {
        $validated = $request->validate([
            'quien_recibe' => 'required|string|max:200',
            'documento_recibe' => 'required|string|max:50',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();
            
            $this->ordenServicioService->generarEntrega(
                $ordenServicio->id,
                $validated['quien_recibe'],
                $validated['documento_recibe'],
                $user->id,
                $validated['observaciones'] ?? null
            );

            return back()->with('success', 'Entrega generada exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
