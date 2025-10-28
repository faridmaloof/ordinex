<?php

namespace App\Services;

use App\Models\Documento\Solicitud;
use App\Models\Documento\SolicitudItem;
use App\Models\Documento\OrdenServicio;
use App\Models\Config\ConfiguracionEmpresa;
use App\Models\Auditoria\Auditoria;
use Illuminate\Support\Facades\DB;
use Exception;

class SolicitudService
{
    /**
     * Crear nueva solicitud con items
     */
    public function crear(array $datos): Solicitud
    {
        return DB::transaction(function () use ($datos) {
            // Validar cliente
            if (!isset($datos['cliente_id'])) {
                throw new Exception('Cliente es requerido');
            }

            // Validar que tenga items
            if (empty($datos['items']) || count($datos['items']) === 0) {
                throw new Exception('La solicitud debe tener al menos un item');
            }

            // Generar número de solicitud
            $numero = Solicitud::generarNumero();

            // Obtener configuración
            $config = ConfiguracionEmpresa::getConfiguracion();

            // Crear solicitud
            $solicitud = Solicitud::create([
                'numero' => $numero,
                'cliente_id' => $datos['cliente_id'],
                'fecha' => $datos['fecha'] ?? now(),
                'fecha_entrega_estimada' => $datos['fecha_entrega_estimada'] ?? null,
                'estado' => 'borrador',
                'usuario_crea_id' => auth()->user()?->id ?? $datos['usuario_id'] ?? null,
                'subtotal' => 0,
                'descuento' => 0,
                'iva' => 0,
                'total' => 0,
                'observaciones' => $datos['observaciones'] ?? null,
                'requiere_autorizacion' => $config->requiere_autorizacion_solicitudes ?? true,
            ]);

            // Crear items
            foreach ($datos['items'] as $itemData) {
                $item = SolicitudItem::create([
                    'solicitud_id' => $solicitud->id,
                    'item_id' => $itemData['item_id'],
                    'cantidad' => $itemData['cantidad'],
                    'precio_unitario' => $itemData['precio_unitario'],
                    'porcentaje_descuento' => $itemData['porcentaje_descuento'] ?? 0,
                    'observaciones' => $itemData['observaciones'] ?? null,
                ]);

                // Calcular totales del item
                $item->calcularTotales();
            }

            // Calcular totales de la solicitud
            $solicitud->calcularTotales();

            // Registrar auditoría
            Auditoria::registrar(
                'crear',
                'solicitud',
                'doc__solicitudes',
                $solicitud->id,
                null,
                $solicitud->toArray()
            );

            return $solicitud->fresh(['items', 'cliente']);
        });
    }

    /**
     * Autorizar solicitud y generar orden automáticamente
     */
    public function autorizar(int $solicitudId, int $usuarioId): Solicitud
    {
        return DB::transaction(function () use ($solicitudId, $usuarioId) {
            $solicitud = Solicitud::with('items')->findOrFail($solicitudId);

            // Validar que puede ser autorizada
            if (!$solicitud->puedeSerAutorizada()) {
                throw new Exception('La solicitud no puede ser autorizada en su estado actual');
            }

            // Autorizar
            $solicitud->autorizar($usuarioId);

            // Si está configurado, generar orden automáticamente
            $config = ConfiguracionEmpresa::getConfiguracion();
            if ($config && $config->genera_orden_automatica) {
                $ordenService = new OrdenServicioService();
                $ordenService->generarDesdeSolicitud($solicitud);
            }

            // Auditoría
            Auditoria::registrar(
                'autorizar',
                'solicitud',
                'doc__solicitudes',
                $solicitud->id,
                ['estado' => 'pendiente'],
                ['estado' => 'autorizada', 'usuario_autoriza_id' => $usuarioId]
            );

            return $solicitud->fresh();
        });
    }

    /**
     * Rechazar solicitud
     */
    public function rechazar(int $solicitudId, int $usuarioId, string $motivo): Solicitud
    {
        return DB::transaction(function () use ($solicitudId, $usuarioId, $motivo) {
            $solicitud = Solicitud::findOrFail($solicitudId);

            if ($solicitud->estado !== 'pendiente') {
                throw new Exception('Solo se pueden rechazar solicitudes pendientes');
            }

            $solicitud->update([
                'estado' => 'rechazada',
                'usuario_autoriza_id' => $usuarioId,
                'fecha_autorizacion' => now(),
                'observaciones' => ($solicitud->observaciones ? $solicitud->observaciones . "\n\n" : '')
                    . "RECHAZADA: " . $motivo,
            ]);

            Auditoria::registrar(
                'rechazar',
                'solicitud',
                'doc__solicitudes',
                $solicitud->id,
                ['estado' => 'pendiente'],
                ['estado' => 'rechazada', 'motivo' => $motivo]
            );

            return $solicitud->fresh();
        });
    }

    /**
     * Actualizar solicitud (solo si no está bloqueada)
     */
    public function actualizar(int $solicitudId, array $datos): Solicitud
    {
        return DB::transaction(function () use ($solicitudId, $datos) {
            $solicitud = Solicitud::findOrFail($solicitudId);

            if (!$solicitud->puedeSerModificada()) {
                throw new Exception('La solicitud no puede ser modificada');
            }

            $datosAnteriores = $solicitud->toArray();

            // Actualizar solicitud
            $solicitud->update([
                'fecha_entrega_estimada' => $datos['fecha_entrega_estimada'] ?? $solicitud->fecha_entrega_estimada,
                'observaciones' => $datos['observaciones'] ?? $solicitud->observaciones,
            ]);

            // Si hay items, actualizarlos
            if (isset($datos['items'])) {
                // Eliminar items existentes
                $solicitud->items()->delete();

                // Crear nuevos items
                foreach ($datos['items'] as $itemData) {
                    $item = SolicitudItem::create([
                        'solicitud_id' => $solicitud->id,
                        'item_id' => $itemData['item_id'],
                        'cantidad' => $itemData['cantidad'],
                        'precio_unitario' => $itemData['precio_unitario'],
                        'porcentaje_descuento' => $itemData['porcentaje_descuento'] ?? 0,
                        'observaciones' => $itemData['observaciones'] ?? null,
                    ]);
                    $item->calcularTotales();
                }

                // Recalcular totales
                $solicitud->calcularTotales();
            }

            Auditoria::registrar(
                'actualizar',
                'solicitud',
                'doc__solicitudes',
                $solicitud->id,
                $datosAnteriores,
                $solicitud->fresh()->toArray()
            );

            return $solicitud->fresh(['items', 'cliente']);
        });
    }

    /**
     * Enviar solicitud a autorización
     */
    public function enviarAutorizacion(int $solicitudId): Solicitud
    {
        $solicitud = Solicitud::findOrFail($solicitudId);

        if ($solicitud->estado !== 'borrador') {
            throw new Exception('Solo se pueden enviar borradores a autorización');
        }

        $solicitud->update(['estado' => 'pendiente']);

        Auditoria::registrar(
            'enviar_autorizacion',
            'solicitud',
            'doc__solicitudes',
            $solicitud->id,
            ['estado' => 'borrador'],
            ['estado' => 'pendiente']
        );

        return $solicitud->fresh();
    }
}
