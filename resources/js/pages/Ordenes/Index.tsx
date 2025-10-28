import React from 'react';
import { router } from '@inertiajs/react';
import { Wrench, Calendar, User, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { Badge } from '@/components/ui/badge';
import { useConfirmDialog } from '@/components/confirm-dialog';

interface Cliente {
  id: number;
  razon_social: string;
  nombre_comercial?: string;
}

interface Usuario {
  id: number;
  name: string;
}

interface Solicitud {
  id: number;
  numero: string;
}

interface OrdenServicio {
  id: number;
  numero: string;
  cliente: Cliente;
  fecha: string;
  fecha_fin_estimada: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado: Usuario;
  usuario_crea: Usuario;
  total: number;
  items_count: number;
  solicitud?: Solicitud;
}

interface Props {
  ordenes: {
    data: OrdenServicio[];
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  filters: Record<string, any>;
  clientes: Cliente[];
  tecnicos: Usuario[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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

export default function Index({ ordenes, filters = {}, clientes, tecnicos }: Props) {
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = (item: OrdenServicio) => {
    confirm({
      title: '¿Eliminar orden?',
      description: `¿Está seguro de eliminar la orden ${item.numero}? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('documentos.ordenes.destroy', item.id), {
          preserveScroll: true,
        });
      },
    });
  };

  const columns: Column<OrdenServicio>[] = [
    {
      header: 'Número',
      accessor: 'numero',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">
              {row.items_count} {row.items_count === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Cliente',
      accessor: 'cliente',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.cliente.razon_social}</div>
          {row.cliente.nombre_comercial && (
            <div className="text-sm text-muted-foreground">{row.cliente.nombre_comercial}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Técnico',
      accessor: 'tecnicoAsignado',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.tecnicoAsignado.name}</span>
        </div>
      ),
    },
    {
      header: 'Fecha',
      accessor: 'fecha',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <div>{formatDate(value)}</div>
            <div className="text-muted-foreground">Entrega: {formatDate(row.fecha_fin_estimada)}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Prioridad',
      accessor: 'prioridad',
      render: (_, row) => getPrioridadBadge(row.prioridad),
      sortable: true,
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (value) => <div className="text-right font-medium">{formatMoney(value)}</div>,
      sortable: true,
      className: 'text-right',
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (_, row) => getEstadoBadge(row.estado),
      sortable: true,
    },
  ];

  const actions: Action<OrdenServicio>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: (row) => router.visit(route('documentos.ordenes.show', row.id)),
      permission: 'ordenes.view',
    },
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: (row) => router.visit(route('documentos.ordenes.edit', row.id)),
      permission: 'ordenes.update',
      show: (row) => ['pendiente', 'en_proceso'].includes(row.estado),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: handleDelete,
      permission: 'ordenes.delete',
      show: (row) => row.estado === 'pendiente',
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
  ];

  const filterDefinitions: Filter[] = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'completada', label: 'Completada' },
        { value: 'entregada', label: 'Entregada' },
      ],
      placeholder: 'Todos',
    },
    {
      name: 'prioridad',
      label: 'Prioridad',
      type: 'select',
      options: [
        { value: 'urgente', label: 'Urgente' },
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' },
      ],
      placeholder: 'Todas',
    },
    {
      name: 'tecnico_asignado_id',
      label: 'Técnico',
      type: 'select',
      options: tecnicos.map((t) => ({ value: t.id.toString(), label: t.name })),
      placeholder: 'Todos',
    },
    {
      name: 'cliente_id',
      label: 'Cliente',
      type: 'select',
      options: clientes.map((c) => ({ value: c.id.toString(), label: c.razon_social })),
      placeholder: 'Todos',
    },
    {
      name: 'fecha_desde',
      label: 'Desde',
      type: 'date',
    },
    {
      name: 'fecha_hasta',
      label: 'Hasta',
      type: 'date',
    },
  ];

  return (
    <CrudLayout
      title="Órdenes de Servicio"
      description="Gestiona las órdenes de servicio"
      createRoute={route('documentos.ordenes.create')}
      createLabel="Nueva Orden"
      createPermission="ordenes.create"
    >
      <DataTableAdvanced
        data={ordenes.data}
        columns={columns}
        actions={actions}
        pagination={ordenes}
        filters={filterDefinitions}
        currentFilters={filters}
        searchable
        searchPlaceholder="Buscar por número, cliente u observaciones..."
        searchFields={['número', 'cliente', 'observaciones']}
        routeName="documentos.ordenes.index"
        emptyMessage="No se encontraron órdenes de servicio"
      />

      {dialog}
    </CrudLayout>
  );
}
