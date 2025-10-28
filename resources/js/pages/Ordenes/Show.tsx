import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Wrench, Calendar, User, Play, CheckCircle, Truck } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Can } from '@/hooks/usePermissions';
import Timeline from '@/components/Timeline';

interface Cliente {
  id: number;
  razon_social: string;
  nombre_comercial?: string;
  telefono?: string;
  email?: string;
}

interface Usuario {
  id: number;
  name: string;
  email: string;
}

interface Item {
  id: number;
  item: {
    id: number;
    codigo: string;
    nombre: string;
  };
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

interface Solicitud {
  id: number;
  numero: string;
}

interface HistorialItem {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario: Usuario;
  observaciones?: string;
  created_at: string;
}

interface OrdenServicio {
  id: number;
  numero: string;
  cliente: Cliente;
  fecha: string;
  fecha_inicio?: string;
  fecha_fin_estimada: string;
  fecha_fin_real?: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado: Usuario;
  usuario_crea: Usuario;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  observaciones?: string;
  items: Item[];
  solicitud?: Solicitud;
  historial: HistorialItem[];
  created_at: string;
  updated_at: string;
}

interface Props {
  orden: OrdenServicio;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
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

function getPrioridadBadge(prioridad: string) {
  switch (prioridad) {
    case 'urgente':
      return <Badge className="bg-red-600">Urgente</Badge>;
    case 'alta':
      return <Badge className="bg-orange-600">Alta</Badge>;
    case 'media':
      return <Badge className="bg-yellow-600">Media</Badge>;
    case 'baja':
      return <Badge className="bg-green-600">Baja</Badge>;
    default:
      return <Badge variant="outline">{prioridad}</Badge>;
  }
}

export default function Show({ orden }: Props) {
  const { confirm, dialog } = useConfirmDialog();
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [observacionesCompletar, setObservacionesCompletar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIniciar = () => {
    confirm({
      title: '¿Iniciar orden?',
      description: `¿Está seguro de iniciar la orden ${orden.numero}? Se marcará como "En Proceso".`,
      variant: 'default',
      confirmText: 'Iniciar',
      onConfirm: () => {
        router.post(route('documentos.ordenes.iniciar', orden.id), {}, {
          preserveScroll: true,
        });
      },
    });
  };

  const handleCompletar = () => {
    setIsSubmitting(true);
    router.post(
      route('documentos.ordenes.completar', orden.id),
      { observaciones: observacionesCompletar },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false);
          setShowCompletarModal(false);
          setObservacionesCompletar('');
        },
      }
    );
  };

  const handleEntregar = () => {
    confirm({
      title: '¿Entregar orden?',
      description: `¿Está seguro de marcar la orden ${orden.numero} como entregada al cliente?`,
      variant: 'default',
      confirmText: 'Entregar',
      onConfirm: () => {
        router.post(route('documentos.ordenes.entregar', orden.id), {}, {
          preserveScroll: true,
        });
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: '¿Eliminar orden?',
      description: `¿Está seguro de eliminar la orden ${orden.numero}? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('documentos.ordenes.destroy', orden.id));
      },
    });
  };

  return (
    <CrudLayout
      title="Detalle de Orden de Servicio"
      description={`Orden ${orden.numero}`}
    >
      <Head title={`Orden ${orden.numero}`} />

      <div className="space-y-6">
        {/* Header con botones de acción */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('documentos.ordenes.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            {getEstadoBadge(orden.estado)}
            {getPrioridadBadge(orden.prioridad)}
          </div>

          <div className="flex items-center gap-2">
            {/* Botones de Workflow */}
            {orden.estado === 'pendiente' && (
              <Can permission="ordenes.iniciar">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleIniciar}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Orden
                </Button>
              </Can>
            )}

            {orden.estado === 'en_proceso' && (
              <Can permission="ordenes.completar">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowCompletarModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Orden
                </Button>
              </Can>
            )}

            {orden.estado === 'completada' && (
              <Can permission="ordenes.entregar">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleEntregar}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Entregar al Cliente
                </Button>
              </Can>
            )}

            {/* Botones CRUD */}
            {['pendiente', 'en_proceso'].includes(orden.estado) && (
              <Can permission="ordenes.update">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.visit(route('documentos.ordenes.edit', orden.id))}
                >
                  Editar
                </Button>
              </Can>
            )}

            {orden.estado === 'pendiente' && (
              <Can permission="ordenes.delete">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Eliminar
                </Button>
              </Can>
            )}
          </div>
        </div>

        {/* Timeline */}
        <Timeline historial={orden.historial} estadoActual={orden.estado} />

        {/* Card 1: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número</label>
                <p className="text-lg font-semibold">{orden.numero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1 flex items-center gap-2">
                  {getEstadoBadge(orden.estado)}
                  {getPrioridadBadge(orden.prioridad)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p>{formatDate(orden.fecha)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha Entrega Estimada</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p>{formatDate(orden.fecha_fin_estimada)}</p>
                </div>
              </div>
              {orden.fecha_inicio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <p>{formatDateTime(orden.fecha_inicio)}</p>
                  </div>
                </div>
              )}
              {orden.fecha_fin_real && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Finalización</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <p>{formatDateTime(orden.fecha_fin_real)}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Técnico Asignado</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="font-medium">{orden.tecnicoAsignado.name}</p>
                    <p className="text-sm text-muted-foreground">{orden.tecnicoAsignado.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creada por</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{orden.usuario_crea.name}</p>
                    <p className="text-sm text-muted-foreground">{orden.usuario_crea.email}</p>
                  </div>
                </div>
              </div>
              {orden.solicitud && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Solicitud de Origen</label>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-medium">{orden.solicitud.numero}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.visit(route('documentos.solicitudes.show', orden.solicitud!.id))}
                    >
                      Ver Solicitud
                    </Button>
                  </div>
                </div>
              )}
              {orden.observaciones && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                  <p className="mt-1 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
                    {orden.observaciones}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
                <p className="text-lg font-semibold">{orden.cliente.razon_social}</p>
              </div>
              {orden.cliente.nombre_comercial && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre Comercial</label>
                  <p>{orden.cliente.nombre_comercial}</p>
                </div>
              )}
              {orden.cliente.telefono && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p>{orden.cliente.telefono}</p>
                </div>
              )}
              {orden.cliente.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{orden.cliente.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Items de la Orden */}
        <Card>
          <CardHeader>
            <CardTitle>Items de la Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Cantidad</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Descuento</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orden.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-mono">{item.item.codigo}</td>
                      <td className="px-4 py-3 text-sm">{item.item.nombre}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatMoney(item.precio_unitario)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.descuento > 0 ? `${item.descuento}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatMoney(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mt-6 flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatMoney(orden.subtotal)}</span>
                </div>
                {orden.descuento > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Descuento:</span>
                    <span>-{formatMoney(orden.descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (13%):</span>
                  <span className="font-medium">{formatMoney(orden.iva)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatMoney(orden.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de auditoría */}
        <div className="text-sm text-muted-foreground text-center border-t pt-4">
          <p>
            Creada el {formatDateTime(orden.created_at)} • Actualizada el{' '}
            {formatDateTime(orden.updated_at)}
          </p>
        </div>
      </div>

      {/* Modal de Completar */}
      <Dialog open={showCompletarModal} onOpenChange={setShowCompletarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Orden de Servicio</DialogTitle>
            <DialogDescription>
              Agregue observaciones finales sobre el trabajo realizado (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="observaciones">Observaciones del Trabajo</Label>
            <Textarea
              id="observaciones"
              value={observacionesCompletar}
              onChange={(e) => setObservacionesCompletar(e.target.value)}
              placeholder="Detalle del trabajo realizado, repuestos utilizados, etc..."
              rows={5}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletarModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleCompletar}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Completando...' : 'Completar Orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {dialog}
    </CrudLayout>
  );
}
