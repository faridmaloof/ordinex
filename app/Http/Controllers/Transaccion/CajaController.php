<?php

namespace App\Http\Controllers\Transaccion;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaccion\AbrirCajaRequest;
use App\Http\Requests\Transaccion\CerrarCajaRequest;
use App\Http\Requests\Transaccion\RegistrarMovimientoRequest;
use App\Models\Config\Caja;
use App\Models\Transaccion\CajaTransaccion;
use App\Services\CajaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CajaController extends Controller
{
    public function __construct(
        protected CajaService $cajaService
    ) {}

    /**
     * Muestra el dashboard principal de cajas.
     */
    public function index()
    {
        $cajasConfig = Caja::with(['cajaAbierta.usuarioCajero'])->get();
        return Inertia::render('Transaccion/Caja/Index', [
            'cajasConfig' => $cajasConfig,
        ]);
    }

    /**
     * Muestra la caja abierta del usuario o el dashboard si no tiene una.
     */
    public function actual()
    {
        $cajaAbierta = $this->cajaService->getCajaAbierta(Auth::id());

        if (!$cajaAbierta) {
            return redirect()->route('caja.index')->with('info', 'No tienes una caja abierta. Por favor, abre una para continuar.');
        }

        $resumen = $this->cajaService->getResumenCaja($cajaAbierta->id);

        return Inertia::render('Transaccion/Caja/Show', [
            'cajaTransaccion' => $cajaAbierta->load(['caja', 'usuarioCajero']),
            'resumen' => $resumen,
        ]);
    }

    public function abrirForm()
    {
        if ($this->cajaService->tieneCajaAbierta(Auth::id())) {
            return redirect()->route('caja.actual')->with('error', 'Ya tienes una caja abierta');
        }
        $cajas = Caja::activas()->orderBy('nombre')->get();
        return Inertia::render('Transaccion/Caja/Abrir', ['cajas' => $cajas]);
    }

    public function abrir(AbrirCajaRequest $request)
    {
        try {
            $this->cajaService->abrir(
                $request->validated()['caja_id'],
                Auth::id(),
                $request->validated()['monto_inicial'],
                $request->validated()['observaciones'] ?? null
            );
            return redirect()->route('caja.actual')->with('success', 'Caja abierta exitosamente');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function cerrarForm(CajaTransaccion $cajaTransaccion)
    {
        $resumen = $this->cajaService->getResumenCaja($cajaTransaccion->id);
        return Inertia::render('Transaccion/Caja/Cerrar', [
            'cajaTransaccion' => $cajaTransaccion,
            'resumen' => $resumen,
        ]);
    }

    public function cerrar(CerrarCajaRequest $request)
    {
        try {
            $this->cajaService->cerrar(
                $request->validated()['caja_transaccion_id'],
                $request->validated()['monto_final_real'],
                $request->validated()['supervisor_id'] ?? null,
                $request->validated()['clave_diaria'] ?? null,
                $request->validated()['justificacion'] ?? null,
                $request->validated()['observaciones'] ?? null
            );
            return redirect()->route('caja.historial')->with('success', 'Caja cerrada exitosamente');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function movimiento(RegistrarMovimientoRequest $request, CajaTransaccion $cajaTransaccion)
    {
        try {
            $this->cajaService->registrarMovimiento(
                $cajaTransaccion->id,
                $request->validated()['tipo'],
                $request->validated()['monto'],
                $request->validated()['concepto'],
                $request->validated()['referencia'] ?? null,
                Auth::id()
            );
            return back()->with('success', 'Movimiento registrado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function historial(Request $request)
    {
        $query = CajaTransaccion::with(['caja', 'usuarioCajero'])->latest('fecha_apertura');
        // ... filters ...
        $transacciones = $query->paginate(15)->withQueryString();
        $cajas = Caja::orderBy('nombre')->get();

        return Inertia::render('Transaccion/Caja/Historial', [
            'transacciones' => $transacciones,
            'cajas' => $cajas,
            'filters' => $request->only(['caja_id', 'estado', 'fecha_desde', 'fecha_hasta']),
        ]);
    }
}