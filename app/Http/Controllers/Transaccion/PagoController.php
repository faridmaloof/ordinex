<?php

namespace App\Http\Controllers\Transaccion;

use App\Http\Controllers\Controller;
use App\Models\Transaccion\Pago;
use App\Models\Catalogo\Cliente;
use App\Models\Catalogo\FormaPago;
use App\Models\Documento\OrdenServicio;
use App\Models\Transaccion\CajaTransaccion;
use App\Services\PagoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PagoController extends Controller
{
    public function __construct(
        protected PagoService $pagoService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Pago::with(['cliente', 'ordenServicio', 'formaPago', 'usuario'])
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

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->filled('tipo_pago')) {
            $query->where('tipo_pago', $request->tipo_pago);
        }

        if ($request->filled('forma_pago_id')) {
            $query->where('forma_pago_id', $request->forma_pago_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        $pagos = $query->paginate(15)->withQueryString();
        $clientes = Cliente::activos()->orderBy('razon_social')->get();
        $formasPago = FormaPago::activas()->orderBy('nombre')->get();

        return Inertia::render('Transaccion/Pago/Index', [
            'pagos' => $pagos,
            'clientes' => $clientes,
            'formasPago' => $formasPago,
            'filters' => $request->only(['search', 'cliente_id', 'tipo_pago', 'forma_pago_id', 'fecha_desde', 'fecha_hasta']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $ordenId = $request->get('orden_servicio_id');
        $orden = null;
        $saldoPendiente = null;

        if ($ordenId) {
            $orden = OrdenServicio::with('cliente')->findOrFail($ordenId);
            $saldoInfo = $this->pagoService->calcularSaldoPendiente($ordenId);
            $saldoPendiente = $saldoInfo['saldo_pendiente'];
        }

        $clientes = Cliente::activos()->orderBy('razon_social')->get();
        $formasPago = FormaPago::activas()->orderBy('nombre')->get();
        $cajasAbiertas = CajaTransaccion::where('estado', 'abierta')
            ->with('caja')
            ->get();

        return Inertia::render('Transaccion/Pago/Create', [
            'orden' => $orden,
            'saldoPendiente' => $saldoPendiente,
            'clientes' => $clientes,
            'formasPago' => $formasPago,
            'cajasAbiertas' => $cajasAbiertas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:cat__clientes,id',
            'orden_servicio_id' => 'nullable|exists:doc__ordenes_servicio,id',
            'forma_pago_id' => 'required|exists:cat__formas_pago,id',
            'tipo_pago' => 'required|in:anticipo,pago_final,abono_credito,credito',
            'monto' => 'required|numeric|min:0.01',
            'referencia' => 'nullable|string|max:100',
            'usa_saldo_favor' => 'boolean',
            'caja_transaccion_id' => 'nullable|exists:trx__cajas_transacciones,id',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $pago = $this->pagoService->registrar($validated);

            return redirect()
                ->route('transacciones.pagos.show', $pago)
                ->with('success', 'Pago registrado exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Pago $pago)
    {
        $pago->load([
            'cliente',
            'ordenServicio',
            'formaPago',
            'usuario',
            'cajaTransaccion.caja',
        ]);

        return Inertia::render('Transaccion/Pago/Show', [
            'pago' => $pago,
        ]);
    }
}
