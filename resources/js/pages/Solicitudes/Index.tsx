import React from 'react';
import { router } from '@inertiajs/react';
import { FileText, Calendar, User, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
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
  cliente: Cliente;
  fecha: string;
  fecha_entrega_estimada: string;
  estado: string;
  usuario_crea: Usuario;
  usuario_autoriza?: Usuario;
  total: number;
  items_count: number;
  requiere_autorizacion: boolean;
}

interface Props {
  solicitudes: {
    data: Solicitud[];
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

export default function Index({ solicitudes, filters = {}, clientes }: Props) {
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = (item: Solicitud) => {
    confirm({
      title: '¿Eliminar solicitud?',
      description: `¿Está seguro de eliminar la solicitud ${item.numero}? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('documentos.solicitudes.destroy', item.id), {
          preserveScroll: true,
        });
      },
    });
  };

  const columns: Column<Solicitud>[] = [
    {
      header: 'Número',
      accessor: 'numero',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
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
      header: 'Fecha',
      accessor: 'fecha',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <div>{formatDate(value)}</div>
            <div className="text-muted-foreground">Entrega: {formatDate(row.fecha_entrega_estimada)}</div>
          </div>
        </div>
      ),
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
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          {getEstadoBadge(row.estado)}
          {row.requiere_autorizacion && row.estado === 'pendiente_autorizacion' && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>Requiere autorización</span>
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Creada por',
      accessor: 'usuario_crea',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.usuario_crea.name}</span>
        </div>
      ),
    },
  ];

  const actions: Action<Solicitud>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: (row) => router.visit(route('documentos.solicitudes.show', row.id)),
      permission: 'solicitudes.view',
    },
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: (row) => router.visit(route('documentos.solicitudes.edit', row.id)),
      permission: 'solicitudes.update',
      show: (row) => row.estado === 'borrador',
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      size: 'sm',
      onClick: handleDelete,
      permission: 'solicitudes.delete',
      show: (row) => row.estado === 'borrador',
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
  ];

  const filterDefinitions: Filter[] = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'borrador', label: 'Borrador' },
        { value: 'pendiente_autorizacion', label: 'Pendiente Autorización' },
        { value: 'autorizada', label: 'Autorizada' },
        { value: 'rechazada', label: 'Rechazada' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'completada', label: 'Completada' },
      ],
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
      title="Solicitudes"
      description="Gestiona las solicitudes de servicio de los clientes"
      createRoute={route('documentos.solicitudes.create')}
      createLabel="Nueva Solicitud"
      createPermission="solicitudes.create"
    >
      <DataTableAdvanced
        data={solicitudes.data}
        columns={columns}
        actions={actions}
        pagination={solicitudes}
        filters={filterDefinitions}
        currentFilters={filters}
        searchable
        searchPlaceholder="Buscar por número, cliente u observaciones..."
        searchFields={['número', 'cliente', 'observaciones']}
        routeName="documentos.solicitudes.index"
        emptyMessage="No se encontraron solicitudes"
      />

      {dialog}
    </CrudLayout>
  );
}
