import React from 'react';
import { Check, Clock, Package, Truck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineItem {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario: {
    id: number;
    name: string;
  };
  observaciones?: string;
  created_at: string;
}

interface TimelineProps {
  historial: TimelineItem[];
  estadoActual: string;
}

const estadosOrden = [
  { key: 'pendiente', label: 'Pendiente', icon: Clock, color: 'text-gray-500' },
  { key: 'en_proceso', label: 'En Proceso', icon: Package, color: 'text-blue-500' },
  { key: 'completada', label: 'Completada', icon: Check, color: 'text-green-500' },
  { key: 'entregada', label: 'Entregada', icon: Truck, color: 'text-purple-500' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'pendiente':
      return <Badge variant="outline" className="bg-gray-100">Pendiente</Badge>;
    case 'en_proceso':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700">En Proceso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="bg-green-100 text-green-700">Completada</Badge>;
    case 'entregada':
      return <Badge variant="outline" className="bg-purple-100 text-purple-700">Entregada</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
}

export default function Timeline({ historial, estadoActual }: TimelineProps) {
  // Crear lista de estados completados basada en el historial
  const estadosCompletados = new Set(historial.map((h) => h.estado_nuevo));
  const estadoActualIndex = estadosOrden.findIndex((e) => e.key === estadoActual);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">Timeline de la Orden</h3>

        <div className="space-y-8">
          {estadosOrden.map((estado, index) => {
            const Icon = estado.icon;
            const isCompleted = estadosCompletados.has(estado.key);
            const isCurrent = estado.key === estadoActual;
            const isPending = index > estadoActualIndex;
            
            // Buscar el evento del historial para este estado
            const evento = historial.find((h) => h.estado_nuevo === estado.key);

            return (
              <div key={estado.key} className="relative flex gap-4">
                {/* Línea vertical */}
                {index < estadosOrden.length - 1 && (
                  <div
                    className={`absolute left-5 top-12 w-0.5 h-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}

                {/* Icono del estado */}
                <div className="relative">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? 'border-green-500 bg-green-50'
                        : isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isCompleted
                          ? 'text-green-500'
                          : isCurrent
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Contenido del estado */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-base">{estado.label}</h4>
                    {isCurrent && (
                      <Badge variant="default" className="bg-blue-500">
                        Estado Actual
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="outline" className="text-gray-500">
                        Pendiente
                      </Badge>
                    )}
                  </div>

                  {evento && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(evento.created_at)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Por: <span className="font-medium text-foreground">{evento.usuario.name}</span>
                      </div>
                      {evento.observaciones && (
                        <div className="mt-2 text-sm bg-gray-50 p-3 rounded-md border">
                          {evento.observaciones}
                        </div>
                      )}
                    </div>
                  )}

                  {!evento && !isPending && isCurrent && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      En progreso...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>
              El timeline muestra el progreso de la orden desde su creación hasta la entrega final.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
