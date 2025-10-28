<?php

namespace App\Services;

use App\Models\Documento\Solicitud;
use App\Models\Documento\OrdenServicio;
use App\Models\Documento\OrdenServicioItem;
use App\Models\Documento\Entrega;
use App\Models\Auditoria\Auditoria;
use Illuminate\Support\Facades\DB;
use Exception;

class OrdenServicioService
{
    /**
     * Generar orden de servicio desde una solicitud
     */
    public function generarDesdeSolicitud(Solicitud $solicitud): OrdenServicio
    {
        return DB::transaction(function () use ($solicitud) {
            // Validar que la solicitud esté autorizada
            if ($solicitud->estado !== 'autorizada') {
                throw new Exception('Solo se pueden generar órdenes desde solicitudes autorizadas');
            }

            // Verificar que no exista ya una orden para esta solicitud
            if ($solicitud->ordenServicio) {
                throw new Exception('Ya existe una orden de servicio para esta solicitud');
            }

            // Generar número
            $numero = OrdenServicio::generarNumero();

            // Crear orden
            $orden = OrdenServicio::create([
                'numero' => $numero,
                'solicitud_id' => $solicitud->id,
                'cliente_id' => $solicitud->cliente_id,
                'fecha' => now(),
                'fecha_fin_estimada' => $solicitud->fecha_entrega_estimada,
                'estado' => 'pendiente',
                'prioridad' => 'normal',
                'usuario_crea_id' => $solicitud->usuario_autoriza_id,
                'subtotal' => $solicitud->subtotal,
                'descuento' => $solicitud->descuento,
                'iva' => $solicitud->iva,
                'total' => $solicitud->total,
                'observaciones' => $solicitud->observaciones,
            ]);

            // Copiar items de solicitud a orden
            foreach ($solicitud->items as $solicitudItem) {
                $ordenItem = OrdenServicioItem::create([
                    'orden_servicio_id' => $orden->id,
                    'item_id' => $solicitudItem->item_id,
                    'cantidad' => $solicitudItem->cantidad,
                    'precio_unitario' => $solicitudItem->precio_unitario,
                    'porcentaje_descuento' => $solicitudItem->porcentaje_descuento,
                    'observaciones' => $solicitudItem->observaciones,
                ]);
                $ordenItem->calcularTotales();
            }

            Auditoria::registrar(
                'generar_desde_solicitud',
                'orden',
                'doc__ordenes_servicio',
                $orden->id,
                null,
                $orden->toArray()
            );

            return $orden->fresh(['items', 'cliente', 'solicitud']);
        });
    }

    /**
     * Asignar técnico a la orden
     */
    public function asignarTecnico(int $ordenId, int $tecnicoId, int $usuarioId): OrdenServicio
    {
        $orden = OrdenServicio::findOrFail($ordenId);

        if ($orden->estaBloqueada()) {
            throw new Exception('La orden está bloqueada y no puede ser modificada');
        }

        $orden->update(['tecnico_asignado_id' => $tecnicoId]);

        $orden->cambiarEstado('asignada', $usuarioId, "Técnico asignado");

        return $orden->fresh();
    }

    /**
     * Iniciar orden de servicio
     */
    public function iniciar(int $ordenId, int $usuarioId): OrdenServicio
    {
        $orden = OrdenServicio::findOrFail($ordenId);

        if (!in_array($orden->estado, ['pendiente', 'asignada'])) {
            throw new Exception('Solo se pueden iniciar órdenes pendientes o asignadas');
        }

        $orden->iniciar($usuarioId);

        return $orden->fresh();
    }

    /**
     * Completar orden de servicio
     */
    public function completar(int $ordenId, int $usuarioId): OrdenServicio
    {
        $orden = OrdenServicio::findOrFail($ordenId);

        if ($orden->estado !== 'en_proceso') {
            throw new Exception('Solo se pueden completar órdenes en proceso');
        }

        $orden->completar($usuarioId);

        return $orden->fresh();
    }

    /**
     * Generar entrega para la orden
     */
    public function generarEntrega(
        int $ordenId,
        string $quienRecibe,
        string $documentoRecibe,
        int $usuarioEntregaId,
        ?string $observaciones = null
    ): Entrega {
        return DB::transaction(function () use ($ordenId, $quienRecibe, $documentoRecibe, $usuarioEntregaId, $observaciones) {
            $orden = OrdenServicio::with('cliente')->findOrFail($ordenId);

            // Validar que la orden esté completada
            if ($orden->estado !== 'completada') {
                throw new Exception('Solo se pueden generar entregas para órdenes completadas');
            }

            // Verificar que no tenga ya una entrega
            if ($orden->entrega) {
                throw new Exception('Esta orden ya tiene una entrega registrada');
            }

            // Generar número
            $numero = Entrega::generarNumero();

            // Crear entrega
            $entrega = Entrega::create([
                'numero' => $numero,
                'orden_servicio_id' => $orden->id,
                'cliente_id' => $orden->cliente_id,
                'fecha_entrega' => now(),
                'quien_recibe' => $quienRecibe,
                'documento_recibe' => $documentoRecibe,
                'usuario_entrega_id' => $usuarioEntregaId,
                'observaciones' => $observaciones,
            ]);

            // Actualizar estado de la orden
            $orden->cambiarEstado('entregada', $usuarioEntregaId, 'Orden entregada al cliente');

            Auditoria::registrar(
                'crear_entrega',
                'entrega',
                'doc__entregas',
                $entrega->id,
                null,
                $entrega->toArray()
            );

            return $entrega->fresh(['ordenServicio', 'cliente']);
        });
    }
}
