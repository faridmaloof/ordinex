import React from 'react';
import { Head, router } from '@inertiajs/react';
import { History, Eye } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Filter } from '@/components/DataTable/DataTableAdvanced';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Caja {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  name: string;
}

interface CajaTransaccion {
  id: number;
  caja: Caja;
  usuario: Usuario;
  fecha_apertura: string;
  fecha_cierre: string | null;
  monto_inicial: number;
  monto_ventas: number;
  monto_gastos: number;
  monto_final_esperado: number;
  monto_final_real: number | null;
  diferencia: number | null;
  estado: 'abierta' | 'cerrada';
}

interface Props {
  cajaTransacciones: {
    data: CajaTransaccion[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    caja_id?: string;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
  cajas: Caja[];
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Historial({ cajaTransacciones, filters, cajas }: Props) {
  const columns: Column<CajaTransaccion>[] = [
    {
      header: 'Fecha Apertura',
      render: (_, row) => (
        <div className="min-w-[140px]">
          <div className="font-medium">{formatDateTime(row.fecha_apertura)}</div>
          {row.fecha_cierre && (
            <div className="text-xs text-muted-foreground mt-1">
              Cerrada: {formatDateTime(row.fecha_cierre)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Caja',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.caja.nombre}</div>
          <div className="text-xs text-muted-foreground">{row.usuario.name}</div>
        </div>
      ),
    },
    {
      header: 'Monto Inicial',
      render: (_, row) => (
        <div className="font-mono text-sm text-blue-600 font-semibold">
          {formatMoney(row.monto_inicial)}
        </div>
      ),
    },
    {
      header: 'Ingresos',
      render: (_, row) => (
        <div className="font-mono text-sm text-green-600 font-semibold">
          + {formatMoney(row.monto_ventas)}
        </div>
      ),
    },
    {
      header: 'Egresos',
      render: (_, row) => (
        <div className="font-mono text-sm text-red-600 font-semibold">
          - {formatMoney(row.monto_gastos)}
        </div>
      ),
    },
    {
      header: 'Esperado',
      render: (_, row) => (
        <div className="font-mono text-sm font-bold">
          {formatMoney(row.monto_final_esperado)}
        </div>
      ),
    },
    {
      header: 'Real',
      render: (_, row) => (
        <div className="font-mono text-sm font-bold">
          {row.monto_final_real !== null
            ? formatMoney(row.monto_final_real)
            : '-'}
        </div>
      ),
    },
    {
      header: 'Diferencia',
      render: (_, row) => {
        const diferencia = row.diferencia;
        if (diferencia === null) return <span className="text-muted-foreground">-</span>;
        
        const tieneDiferencia = Math.abs(diferencia) > 0.01;
        const color = tieneDiferencia 
          ? diferencia > 0 
            ? 'text-green-600' 
            : 'text-red-600'
          : 'text-gray-600';

        return (
          <div className={`font-mono text-sm font-bold ${color}`}>
            {diferencia > 0 && '+'}
            {formatMoney(diferencia)}
          </div>
        );
      },
    },
    {
      header: 'Estado',
      render: (_, row) => {
        const estado = row.estado;
        return (
          <Badge
            variant={estado === 'abierta' ? 'default' : 'secondary'}
            className={estado === 'abierta' ? 'bg-blue-600' : 'bg-green-600'}
          >
            {estado === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
        );
      },
    },
    {
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.visit(route('transacciones.caja.show', row.id))}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
        </div>
      ),
    },
  ];

  const filterDefinitions: Filter[] = [
    {
      name: 'caja_id',
      label: 'Caja',
      type: 'select' as const,
      options: cajas.map((caja) => ({
        value: caja.id.toString(),
        label: caja.nombre,
      })),
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'abierta', label: 'Abierta' },
        { value: 'cerrada', label: 'Cerrada' },
      ],
    },
    {
      name: 'fecha_desde',
      label: 'Desde',
      type: 'date' as const,
    },
    {
      name: 'fecha_hasta',
      label: 'Hasta',
      type: 'date' as const,
    },
  ];

  return (
    <CrudLayout
      title="Historial de Cajas"
      description="Consulta el historial completo de aperturas y cierres de caja"
    >
      <Head title="Historial de Cajas" />

      <DataTableAdvanced
        data={cajaTransacciones.data}
        columns={columns}
        pagination={{
          current_page: cajaTransacciones.current_page,
          from: 1,
          last_page: cajaTransacciones.last_page,
          path: route('transacciones.caja.historial'),
          per_page: cajaTransacciones.per_page,
          to: cajaTransacciones.data.length,
          total: cajaTransacciones.total,
          links: [],
        }}
        filters={filterDefinitions}
        currentFilters={filters}
        routeName="transacciones.caja.historial"
        searchPlaceholder="Buscar por cajero..."
        emptyMessage="No hay transacciones"
      />
    </CrudLayout>
  );
}
