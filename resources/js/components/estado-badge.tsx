import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Estados de Solicitud
export type EstadoSolicitud =
    | 'borrador'
    | 'pendiente_autorizacion'
    | 'autorizada'
    | 'rechazada'
    | 'cancelada';

// Estados de Orden de Servicio
export type EstadoOrden =
    | 'pendiente'
    | 'en_proceso'
    | 'completada'
    | 'pendiente_entrega'
    | 'entregada'
    | 'cancelada';

// Estados de Caja
export type EstadoCaja = 'abierta' | 'cerrada';

// Tipos de Pago
export type TipoPago = 'anticipo' | 'pago_final' | 'credito';

// Tipos de Transacción de Caja
export type TipoTransaccion = 'apertura' | 'cierre' | 'ingreso' | 'egreso';

interface EstadoBadgeProps {
    estado: EstadoSolicitud | EstadoOrden | EstadoCaja | TipoPago | TipoTransaccion | string;
    className?: string;
}

/**
 * Configuración de colores y textos para cada estado
 */
const estadoConfig: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string;
    }
> = {
    // Estados Solicitud
    borrador: {
        label: 'Borrador',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-800',
    },
    pendiente_autorizacion: {
        label: 'Pendiente Autorización',
        variant: 'default',
        className: 'bg-yellow-100 text-yellow-800',
    },
    autorizada: {
        label: 'Autorizada',
        variant: 'default',
        className: 'bg-green-100 text-green-800',
    },
    rechazada: {
        label: 'Rechazada',
        variant: 'destructive',
    },
    cancelada: {
        label: 'Cancelada',
        variant: 'outline',
        className: 'text-gray-500',
    },

    // Estados Orden
    pendiente: {
        label: 'Pendiente',
        variant: 'default',
        className: 'bg-blue-100 text-blue-800',
    },
    en_proceso: {
        label: 'En Proceso',
        variant: 'default',
        className: 'bg-purple-100 text-purple-800',
    },
    completada: {
        label: 'Completada',
        variant: 'default',
        className: 'bg-green-100 text-green-800',
    },
    pendiente_entrega: {
        label: 'Pendiente Entrega',
        variant: 'default',
        className: 'bg-orange-100 text-orange-800',
    },
    entregada: {
        label: 'Entregada',
        variant: 'default',
        className: 'bg-teal-100 text-teal-800',
    },

    // Estados Caja
    abierta: {
        label: 'Abierta',
        variant: 'default',
        className: 'bg-green-100 text-green-800',
    },
    cerrada: {
        label: 'Cerrada',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-800',
    },

    // Tipos de Pago
    anticipo: {
        label: 'Anticipo',
        variant: 'default',
        className: 'bg-blue-100 text-blue-800',
    },
    pago_final: {
        label: 'Pago Final',
        variant: 'default',
        className: 'bg-green-100 text-green-800',
    },
    credito: {
        label: 'Crédito',
        variant: 'default',
        className: 'bg-orange-100 text-orange-800',
    },

    // Tipos de Transacción Caja
    apertura: {
        label: 'Apertura',
        variant: 'default',
        className: 'bg-green-100 text-green-800',
    },
    cierre: {
        label: 'Cierre',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-800',
    },
    ingreso: {
        label: 'Ingreso',
        variant: 'default',
        className: 'bg-blue-100 text-blue-800',
    },
    egreso: {
        label: 'Egreso',
        variant: 'destructive',
        className: 'bg-red-100 text-red-800',
    },
};

/**
 * Componente EstadoBadge
 * Muestra un badge con color y texto según el estado
 */
export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
    const config = estadoConfig[estado] || {
        label: estado,
        variant: 'outline' as const,
    };

    return (
        <Badge variant={config.variant} className={cn(config.className, className)}>
            {config.label}
        </Badge>
    );
}
