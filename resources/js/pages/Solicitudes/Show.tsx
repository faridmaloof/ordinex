import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Can } from '@/hooks/usePermissions';

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

interface OrdenServicio {
  id: number;
  numero: string;
  estado: string;
}

interface Solicitud {
  id: number;
  numero: string;
  cliente: Cliente;
  fecha: string;
  fecha_entrega_estimada: string;
  estado: string;
  usuario_crea: Usuario;
  usuario_autoriza?: Usuario;
  fecha_autorizacion?: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  observaciones?: string;
  requiere_autorizacion: boolean;
  items: Item[];
  ordenServicio?: OrdenServicio;
  created_at: string;
  updated_at: string;
}

interface Props {
  solicitud: Solicitud;
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
    case 'borrador':
      return <Badge variant="outline" className="bg-gray-100">Borrador</Badge>;
    case 'pendiente_autorizacion':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Pendiente Autorización</Badge>;
    case 'autorizada':
      return <Badge variant="outline" className="bg-green-100 text-green-700">Autorizada</Badge>;
    case 'rechazada':
      return <Badge variant="outline" className="bg-red-100 text-red-700">Rechazada</Badge>;
    case 'en_proceso':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700">En Proceso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="bg-purple-100 text-purple-700">Completada</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
}

export default function Show({ solicitud }: Props) {
  const { confirm, dialog } = useConfirmDialog();
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutorizar = () => {
    confirm({
      title: '¿Autorizar solicitud?',
      description: `¿Está seguro de autorizar la solicitud ${solicitud.numero}? Una vez autorizada, se podrá generar una orden de servicio.`,
      variant: 'default',
      confirmText: 'Autorizar',
      onConfirm: () => {
        router.post(route('documentos.solicitudes.autorizar', solicitud.id), {}, {
          preserveScroll: true,
        });
      },
    });
  };

  const handleRechazar = () => {
    if (motivoRechazo.trim().length < 10) {
      alert('El motivo del rechazo debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    router.post(
      route('documentos.solicitudes.rechazar', solicitud.id),
      { motivo: motivoRechazo },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false);
          setShowRechazarModal(false);
          setMotivoRechazo('');
        },
      }
    );
  };

  const handleDelete = () => {
    confirm({
      title: '¿Eliminar solicitud?',
      description: `¿Está seguro de eliminar la solicitud ${solicitud.numero}? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('documentos.solicitudes.destroy', solicitud.id));
      },
    });
  };

  return (
    <CrudLayout
      title="Detalle de Solicitud"
      description={`Solicitud ${solicitud.numero}`}
    >
      <Head title={`Solicitud ${solicitud.numero}`} />

      <div className="space-y-6">
        {/* Header con botones de acción */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('documentos.solicitudes.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            {getEstadoBadge(solicitud.estado)}
          </div>

          <div className="flex items-center gap-2">
            {/* Botones de Workflow */}
            {solicitud.estado === 'pendiente_autorizacion' && (
              <>
                <Can permission="solicitudes.authorize">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAutorizar}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Autorizar
                  </Button>
                </Can>
                <Can permission="solicitudes.reject">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRechazarModal(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </Can>
              </>
            )}

            {/* Botones CRUD */}
            {solicitud.estado === 'borrador' && (
              <>
                <Can permission="solicitudes.update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('documentos.solicitudes.edit', solicitud.id))}
                  >
                    Editar
                  </Button>
                </Can>
                <Can permission="solicitudes.delete">
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Eliminar
                  </Button>
                </Can>
              </>
            )}
          </div>
        </div>

        {/* Alerta si requiere autorización */}
        {solicitud.requiere_autorizacion && solicitud.estado === 'pendiente_autorizacion' && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Requiere Autorización</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Esta solicitud supera el monto máximo permitido y necesita autorización de un supervisor
                    antes de poder procesarse.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 1: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número</label>
                <p className="text-lg font-semibold">{solicitud.numero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">{getEstadoBadge(solicitud.estado)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p>{formatDate(solicitud.fecha)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha Entrega Estimada</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p>{formatDate(solicitud.fecha_entrega_estimada)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creada por</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{solicitud.usuario_crea.name}</p>
                    <p className="text-sm text-muted-foreground">{solicitud.usuario_crea.email}</p>
                  </div>
                </div>
              </div>
              {solicitud.usuario_autoriza && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Autorizada por</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{solicitud.usuario_autoriza.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {solicitud.fecha_autorizacion && formatDateTime(solicitud.fecha_autorizacion)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {solicitud.observaciones && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                  <p className="mt-1 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
                    {solicitud.observaciones}
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
                <p className="text-lg font-semibold">{solicitud.cliente.razon_social}</p>
              </div>
              {solicitud.cliente.nombre_comercial && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre Comercial</label>
                  <p>{solicitud.cliente.nombre_comercial}</p>
                </div>
              )}
              {solicitud.cliente.telefono && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p>{solicitud.cliente.telefono}</p>
                </div>
              )}
              {solicitud.cliente.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{solicitud.cliente.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Items de la Solicitud */}
        <Card>
          <CardHeader>
            <CardTitle>Items de la Solicitud</CardTitle>
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
                  {solicitud.items.map((item) => (
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
                  <span className="font-medium">{formatMoney(solicitud.subtotal)}</span>
                </div>
                {solicitud.descuento > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Descuento:</span>
                    <span>-{formatMoney(solicitud.descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (13%):</span>
                  <span className="font-medium">{formatMoney(solicitud.iva)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatMoney(solicitud.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Orden de Servicio (si existe) */}
        {solicitud.ordenServicio && (
          <Card>
            <CardHeader>
              <CardTitle>Orden de Servicio Generada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Orden</p>
                  <p className="text-lg font-semibold">{solicitud.ordenServicio.numero}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.visit(route('documentos.ordenes.show', solicitud.ordenServicio!.id))}
                >
                  Ver Orden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de auditoría */}
        <div className="text-sm text-muted-foreground text-center border-t pt-4">
          <p>
            Creada el {formatDateTime(solicitud.created_at)} • Actualizada el{' '}
            {formatDateTime(solicitud.updated_at)}
          </p>
        </div>
      </div>

      {/* Modal de Rechazo */}
      <Dialog open={showRechazarModal} onOpenChange={setShowRechazarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Por favor, proporcione el motivo del rechazo. Esto se registrará en las observaciones de la
              solicitud.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="motivo">Motivo del Rechazo *</Label>
            <Textarea
              id="motivo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ingrese el motivo del rechazo (mínimo 10 caracteres)..."
              rows={4}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {motivoRechazo.length}/10 caracteres mínimos
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRechazarModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRechazar}
              disabled={motivoRechazo.trim().length < 10 || isSubmitting}
            >
              {isSubmitting ? 'Rechazando...' : 'Rechazar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {dialog}
    </CrudLayout>
  );
}
