<?php

namespace App\Http\Controllers\Transaccion;

use App\Http\Controllers\Controller;
use App\Models\Config\Caja;
use App\Models\Transaccion\CajaTransaccion;
use App\Services\CajaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CajaController extends Controller
{
    public function __construct(
        protected CajaService $cajaService
    ) {}

    /**
     * Mostrar caja abierta del usuario actual
     */
    public function actual()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $cajaAbierta = $this->cajaService->getCajaAbierta($user->id);

        if (!$cajaAbierta) {
            return Inertia::render('Transaccion/Caja/SinCaja');
        }

        $resumen = $this->cajaService->getResumenCaja($cajaAbierta->id);

        return Inertia::render('Transaccion/Caja/Actual', [
            'cajaTransaccion' => $cajaAbierta,
            'resumen' => $resumen,
        ]);
    }

    /**
     * Formulario para abrir caja
     */
    public function abrirForm()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        // Verificar si ya tiene caja abierta
        if ($this->cajaService->tieneCajaAbierta($user->id)) {
            return redirect()
                ->route('transacciones.caja.actual')
                ->with('error', 'Ya tienes una caja abierta');
        }

        $cajas = Caja::activas()->orderBy('nombre')->get();

        return Inertia::render('Transaccion/Caja/Abrir', [
            'cajas' => $cajas,
        ]);
    }

    /**
     * Abrir caja
     */
    public function abrir(Request $request)
    {
        $validated = $request->validate([
            'caja_id' => 'required|exists:cnf__cajas,id',
            'monto_inicial' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();

            $cajaTransaccion = $this->cajaService->abrir(
                $validated['caja_id'],
                $user->id,
                $validated['monto_inicial'],
                $validated['observaciones'] ?? null
            );

            return redirect()
                ->route('transacciones.caja.actual')
                ->with('success', 'Caja abierta exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Formulario para cerrar caja
     */
    public function cerrarForm()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $cajaAbierta = $this->cajaService->getCajaAbierta($user->id);

        if (!$cajaAbierta) {
            return redirect()
                ->route('transacciones.caja.abrir-form')
                ->with('error', 'No tienes una caja abierta');
        }

        $resumen = $this->cajaService->getResumenCaja($cajaAbierta->id);

        return Inertia::render('Transaccion/Caja/Cerrar', [
            'cajaTransaccion' => $cajaAbierta,
            'resumen' => $resumen,
        ]);
    }

    /**
     * Cerrar caja
     */
    public function cerrar(Request $request)
    {
        $validated = $request->validate([
            'caja_transaccion_id' => 'required|exists:trx__cajas_transacciones,id',
            'monto_final_real' => 'required|numeric|min:0',
            'supervisor_id' => 'nullable|exists:users,id',
            'clave_diaria' => 'nullable|string|max:50',
            'justificacion' => 'nullable|string|max:500',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $cajaTransaccion = $this->cajaService->cerrar(
                $validated['caja_transaccion_id'],
                $validated['monto_final_real'],
                $validated['supervisor_id'] ?? null,
                $validated['clave_diaria'] ?? null,
                $validated['justificacion'] ?? null,
                $validated['observaciones'] ?? null
            );

            return redirect()
                ->route('transacciones.caja.historial')
                ->with('success', 'Caja cerrada exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Registrar movimiento de caja
     */
    public function movimiento(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|in:ingreso,egreso',
            'monto' => 'required|numeric|min:0.01',
            'concepto' => 'required|string|max:200',
            'referencia' => 'nullable|string|max:100',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = auth()->user();

            $cajaAbierta = $this->cajaService->getCajaAbierta($user->id);

            if (!$cajaAbierta) {
                return back()->with('error', 'No tienes una caja abierta');
            }

            $this->cajaService->registrarMovimiento(
                $cajaAbierta->id,
                $validated['tipo'],
                $validated['monto'],
                $validated['concepto'],
                $validated['referencia'] ?? null,
                $user->id
            );

            return back()->with('success', 'Movimiento registrado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Historial de cajas
     */
    public function historial(Request $request)
    {
        $query = CajaTransaccion::with(['caja', 'usuario'])
            ->orderBy('fecha_apertura', 'desc');

        if ($request->filled('caja_id')) {
            $query->where('caja_id', $request->caja_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_apertura', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_apertura', '<=', $request->fecha_hasta);
        }

        $transacciones = $query->paginate(15)->withQueryString();
        $cajas = Caja::orderBy('nombre')->get();

        return Inertia::render('Transaccion/Caja/Historial', [
            'transacciones' => $transacciones,
            'cajas' => $cajas,
            'filters' => $request->only(['caja_id', 'estado', 'fecha_desde', 'fecha_hasta']),
        ]);
    }
}
