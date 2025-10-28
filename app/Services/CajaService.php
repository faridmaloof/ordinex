<?php

namespace App\Services;

use App\Models\Config\Caja;
use App\Models\Transaccion\CajaTransaccion;
use App\Models\Transaccion\MovimientoCaja;
use App\Models\Transaccion\DiferenciaCaja;
use App\Models\Config\ClaveDiaria;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class CajaService
{
    /**
     * Abrir caja con validaciones
     */
    public function abrir(int $cajaId, int $usuarioId, float $montoInicial, ?string $observaciones = null): CajaTransaccion
    {
        return DB::transaction(function () use ($cajaId, $usuarioId, $montoInicial, $observaciones) {
            // Validar que la caja existe y está activa
            $caja = Caja::findOrFail($cajaId);
            if (!$caja->activa) {
                throw new Exception('La caja no está activa');
            }

            // Validar que no hay una caja abierta para este usuario
            $cajaAbierta = CajaTransaccion::where('usuario_id', $usuarioId)
                ->where('estado', 'abierta')
                ->first();

            if ($cajaAbierta) {
                throw new Exception('Ya tiene una caja abierta. Debe cerrarla primero.');
            }

            // Validar que no hay otra caja abierta en la misma caja física
            $otraCajaAbierta = CajaTransaccion::where('caja_id', $cajaId)
                ->where('estado', 'abierta')
                ->first();

            if ($otraCajaAbierta) {
                throw new Exception('Esta caja ya está abierta por otro usuario');
            }

            // Validar monto inicial
            if ($montoInicial < 0) {
                throw new Exception('El monto inicial no puede ser negativo');
            }

            // Crear transacción de caja
            $cajaTransaccion = CajaTransaccion::create([
                'caja_id' => $cajaId,
                'usuario_id' => $usuarioId,
                'fecha_apertura' => now(),
                'monto_inicial' => $montoInicial,
                'monto_ventas' => 0,
                'monto_gastos' => 0,
                'monto_final_esperado' => $montoInicial,
                'monto_final_real' => 0,
                'diferencia' => 0,
                'estado' => 'abierta',
                'observaciones_apertura' => $observaciones,
            ]);

            return $cajaTransaccion;
        });
    }

    /**
     * Cerrar caja con validación obligatoria
     */
    public function cerrar(
        int $cajaTransaccionId,
        float $montoFinalReal,
        ?int $supervisorId = null,
        ?string $claveDiaria = null,
        ?string $justificacion = null,
        ?string $observaciones = null
    ): CajaTransaccion {
        return DB::transaction(function () use ($cajaTransaccionId, $montoFinalReal, $supervisorId, $claveDiaria, $justificacion, $observaciones) {
            // Obtener transacción de caja
            $cajaTransaccion = CajaTransaccion::with('caja')->findOrFail($cajaTransaccionId);

            // Validar que está abierta
            if ($cajaTransaccion->estado !== 'abierta') {
                throw new Exception('La caja no está abierta');
            }

            // Calcular monto esperado
            $montoEsperado = $cajaTransaccion->monto_inicial + $cajaTransaccion->monto_ventas - $cajaTransaccion->monto_gastos;
            $diferencia = $montoFinalReal - $montoEsperado;

            // Si hay diferencia, validar autorización
            if (abs($diferencia) > 0.01) {
                // Verificar si la caja requiere autorización
                if ($cajaTransaccion->caja->requiere_autorizacion_cierre) {
                    if (!$supervisorId || !$claveDiaria) {
                        throw new Exception('Se requiere autorización de supervisor para cerrar con diferencia');
                    }

                    // Validar supervisor
                    $supervisor = User::findOrFail($supervisorId);
                    if (!$supervisor->rol || !$supervisor->rol->puede_cerrar_caja_con_diferencia) {
                        throw new Exception('El supervisor no tiene permisos para autorizar el cierre con diferencia');
                    }

                    // Validar clave diaria
                    if (!ClaveDiaria::validar($claveDiaria, now()->toDateString())) {
                        throw new Exception('Clave diaria inválida');
                    }

                    if (!$justificacion) {
                        throw new Exception('Se requiere justificación para el cierre con diferencia');
                    }

                    // Registrar diferencia autorizada
                    DiferenciaCaja::create([
                        'caja_transaccion_id' => $cajaTransaccion->id,
                        'monto_diferencia' => abs($diferencia),
                        'tipo_diferencia' => $diferencia > 0 ? 'sobrante' : 'faltante',
                        'supervisor_id' => $supervisorId,
                        'clave_diaria' => $claveDiaria,
                        'fecha_autorizacion' => now(),
                        'justificacion' => $justificacion,
                    ]);
                } else {
                    // La caja no requiere autorización pero registramos la diferencia
                    if (abs($diferencia) > 100) { // Diferencia significativa sin autorización
                        throw new Exception('La diferencia es muy alta. Se requiere autorización de supervisor.');
                    }
                }
            }

            // Actualizar transacción de caja
            $cajaTransaccion->update([
                'fecha_cierre' => now(),
                'monto_final_esperado' => $montoEsperado,
                'monto_final_real' => $montoFinalReal,
                'diferencia' => $diferencia,
                'estado' => 'cerrada',
                'observaciones_cierre' => $observaciones,
            ]);

            return $cajaTransaccion->fresh();
        });
    }

    /**
     * Registrar movimiento de caja (ingreso o egreso)
     */
    public function registrarMovimiento(
        int $cajaTransaccionId,
        string $tipo,
        float $monto,
        string $concepto,
        ?string $referencia = null,
        ?int $usuarioId = null
    ): MovimientoCaja {
        return DB::transaction(function () use ($cajaTransaccionId, $tipo, $monto, $concepto, $referencia, $usuarioId) {
            // Validar caja abierta
            $cajaTransaccion = CajaTransaccion::findOrFail($cajaTransaccionId);
            if ($cajaTransaccion->estado !== 'abierta') {
                throw new Exception('La caja no está abierta');
            }

            // Validar tipo
            if (!in_array($tipo, ['ingreso', 'egreso'])) {
                throw new Exception('Tipo de movimiento inválido');
            }

            // Validar monto
            if ($monto <= 0) {
                throw new Exception('El monto debe ser mayor a cero');
            }

            // Crear movimiento
            $movimiento = MovimientoCaja::create([
                'caja_transaccion_id' => $cajaTransaccionId,
                'tipo' => $tipo,
                'monto' => $monto,
                'concepto' => $concepto,
                'referencia' => $referencia,
                'usuario_id' => $usuarioId ?? auth()->user()?->id,
            ]);

            // Actualizar totales de caja
            if ($tipo === 'ingreso') {
                $cajaTransaccion->increment('monto_ventas', $monto);
            } else {
                $cajaTransaccion->increment('monto_gastos', $monto);
            }

            // Recalcular monto esperado
            $montoEsperado = $cajaTransaccion->monto_inicial + $cajaTransaccion->monto_ventas - $cajaTransaccion->monto_gastos;
            $cajaTransaccion->update(['monto_final_esperado' => $montoEsperado]);

            return $movimiento;
        });
    }

    /**
     * Obtener caja actualmente abierta del usuario
     */
    public function getCajaAbierta(int $usuarioId): ?CajaTransaccion
    {
        return CajaTransaccion::with(['caja', 'movimientos', 'diferencias'])
            ->where('usuario_id', $usuarioId)
            ->where('estado', 'abierta')
            ->first();
    }

    /**
     * Verificar si el usuario tiene una caja abierta
     */
    public function tieneCajaAbierta(int $usuarioId): bool
    {
        return CajaTransaccion::where('usuario_id', $usuarioId)
            ->where('estado', 'abierta')
            ->exists();
    }

    /**
     * Obtener resumen de caja
     */
    public function getResumenCaja(int $cajaTransaccionId): array
    {
        $caja = CajaTransaccion::with(['movimientos', 'diferencias', 'pagos'])
            ->findOrFail($cajaTransaccionId);

        $movimientos = $caja->movimientos;
        $ingresos = $movimientos->where('tipo', 'ingreso')->sum('monto');
        $egresos = $movimientos->where('tipo', 'egreso')->sum('monto');

        return [
            'monto_inicial' => $caja->monto_inicial,
            'ingresos' => $ingresos,
            'egresos' => $egresos,
            'monto_esperado' => $caja->monto_final_esperado,
            'monto_real' => $caja->monto_final_real,
            'diferencia' => $caja->diferencia,
            'total_movimientos' => $movimientos->count(),
            'total_pagos' => $caja->pagos->count(),
            'estado' => $caja->estado,
        ];
    }
}
