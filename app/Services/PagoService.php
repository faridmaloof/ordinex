<?php

namespace App\Services;

use App\Models\Transaccion\Pago;
use App\Models\Catalogo\Cliente;
use App\Models\Documento\OrdenServicio;
use App\Models\Transaccion\CajaTransaccion;
use App\Models\Auditoria\Auditoria;
use Illuminate\Support\Facades\DB;
use Exception;

class PagoService
{
    /**
     * Registrar pago (anticipo, pago final, o abono a crédito)
     */
    public function registrar(array $datos): Pago
    {
        return DB::transaction(function () use ($datos) {
            // Validar cliente
            $cliente = Cliente::findOrFail($datos['cliente_id']);

            // Validar que hay una caja abierta
            if (isset($datos['caja_transaccion_id'])) {
                $caja = CajaTransaccion::findOrFail($datos['caja_transaccion_id']);
                if ($caja->estado !== 'abierta') {
                    throw new Exception('La caja no está abierta');
                }
            }

            // Validar tipo de pago
            $tipoPago = $datos['tipo_pago'] ?? 'pago_final';
            if (!in_array($tipoPago, ['anticipo', 'pago_final', 'abono_credito', 'credito'])) {
                throw new Exception('Tipo de pago inválido');
            }

            // Si es anticipo o pago final, validar orden
            if (in_array($tipoPago, ['anticipo', 'pago_final'])) {
                if (!isset($datos['orden_servicio_id'])) {
                    throw new Exception('Se requiere orden de servicio');
                }

                $orden = OrdenServicio::findOrFail($datos['orden_servicio_id']);

                // Si es anticipo, validar porcentaje mínimo
                if ($tipoPago === 'anticipo') {
                    $config = \App\Models\Config\ConfiguracionEmpresa::getConfiguracion();
                    if ($config && $config->requiere_pago_antes_entrega) {
                        $porcentajeMinimo = $config->porcentaje_anticipo_minimo;
                        $montoMinimo = $orden->total * ($porcentajeMinimo / 100);

                        if ($datos['monto'] < $montoMinimo) {
                            throw new Exception("El anticipo debe ser al menos {$porcentajeMinimo}% del total ({$montoMinimo})");
                        }
                    }
                }
            }

            // Calcular uso de saldo a favor
            $montoSaldoFavor = 0;
            if ($datos['usa_saldo_favor'] ?? false) {
                $montoSaldoFavor = min($cliente->saldo_favor, $datos['monto']);
            }

            // Generar número
            $numero = Pago::generarNumero();

            // Crear pago
            $pago = Pago::create([
                'numero' => $numero,
                'cliente_id' => $datos['cliente_id'],
                'orden_servicio_id' => $datos['orden_servicio_id'] ?? null,
                'forma_pago_id' => $datos['forma_pago_id'],
                'fecha' => now(),
                'monto' => $datos['monto'],
                'tipo_pago' => $tipoPago,
                'referencia' => $datos['referencia'] ?? null,
                'usa_saldo_favor' => $datos['usa_saldo_favor'] ?? false,
                'monto_saldo_favor' => $montoSaldoFavor,
                'caja_transaccion_id' => $datos['caja_transaccion_id'] ?? null,
                'usuario_id' => auth()->user()?->id ?? $datos['usuario_id'] ?? null,
                'observaciones' => $datos['observaciones'] ?? null,
            ]);

            // Actualizar saldos del cliente según tipo de pago
            if ($tipoPago === 'credito') {
                // Incrementar saldo pendiente
                $cliente->agregarSaldoPendiente($datos['monto']);
            } elseif ($tipoPago === 'abono_credito') {
                // Reducir saldo pendiente
                $cliente->reducirSaldoPendiente($datos['monto']);
            } elseif ($montoSaldoFavor > 0) {
                // Usar saldo a favor
                $cliente->usarSaldoFavor($montoSaldoFavor);
            }

            // Si el pago excede el total, agregar a saldo a favor
            if (isset($orden)) {
                $totalPagado = $orden->pagos()->sum('monto');
                if ($totalPagado > $orden->total) {
                    $sobrante = $totalPagado - $orden->total;
                    $cliente->agregarSaldoFavor($sobrante);
                }
            }

            // Registrar movimiento en caja (si corresponde)
            if (isset($datos['caja_transaccion_id'])) {
                $cajaService = new CajaService();
                $cajaService->registrarMovimiento(
                    $datos['caja_transaccion_id'],
                    'ingreso',
                    $datos['monto'],
                    "Pago {$numero} - Cliente: {$cliente->razon_social}",
                    $datos['referencia'] ?? null,
                    auth()->user()?->id ?? $datos['usuario_id'] ?? null
                );
            }

            Auditoria::registrar(
                'registrar_pago',
                'pago',
                'trx__pagos',
                $pago->id,
                null,
                $pago->toArray()
            );

            return $pago->fresh(['cliente', 'ordenServicio', 'formaPago']);
        });
    }

    /**
     * Calcular saldo pendiente de una orden
     */
    public function calcularSaldoPendiente(int $ordenServicioId): array
    {
        $orden = OrdenServicio::with('pagos')->findOrFail($ordenServicioId);

        $totalOrden = $orden->total;
        $totalPagado = $orden->pagos()->sum('monto');
        $saldoPendiente = $totalOrden - $totalPagado;

        return [
            'total_orden' => $totalOrden,
            'total_pagado' => $totalPagado,
            'saldo_pendiente' => $saldoPendiente,
            'porcentaje_pagado' => $totalOrden > 0 ? ($totalPagado / $totalOrden) * 100 : 0,
            'pagos' => $orden->pagos,
        ];
    }

    /**
     * Verificar si se puede entregar (pagado completamente o con anticipo mínimo)
     */
    public function puedeEntregar(int $ordenServicioId): bool
    {
        $saldo = $this->calcularSaldoPendiente($ordenServicioId);
        $config = \App\Models\Config\ConfiguracionEmpresa::getConfiguracion();

        if (!$config || !$config->requiere_pago_antes_entrega) {
            return true;
        }

        // Verificar que se haya pagado al menos el porcentaje mínimo
        return $saldo['porcentaje_pagado'] >= $config->porcentaje_anticipo_minimo;
    }
}
