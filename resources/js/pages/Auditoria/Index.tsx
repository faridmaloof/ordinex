import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FileSearch, ChevronDown, ChevronRight } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Filter } from '@/components/DataTable/DataTableAdvanced';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Usuario {
  id: number;
  name: string;
  email: string;
}

interface Auditoria {
  id: number;
  usuario: Usuario;
  accion: 'create' | 'update' | 'delete';
  modulo: string;
  tabla: string;
  registro_id: number | null;
  datos_anteriores: Record<string, any> | null;
  datos_nuevos: Record<string, any> | null;
  ip: string;
  user_agent: string;
  created_at: string;
}

interface Props {
  auditorias: {
    data: Auditoria[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    usuario_id?: string;
    tabla?: string;
    accion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
  usuarios: Usuario[];
  tablas: string[];
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getAccionBadge(accion: string) {
  const configs: Record<string, { label: string; className: string }> = {
    create: { label: 'Crear', className: 'bg-green-600' },
    update: { label: 'Actualizar', className: 'bg-blue-600' },
    delete: { label: 'Eliminar', className: 'bg-red-600' },
  };

  const config = configs[accion] || { label: accion, className: 'bg-gray-600' };

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

function getTablaBadge(tabla: string) {
  // Colores para diferentes tipos de tablas
  const colores: Record<string, string> = {
    'cat__': 'bg-purple-100 text-purple-800 border-purple-300',
    'cfg__': 'bg-blue-100 text-blue-800 border-blue-300',
    'trx__': 'bg-orange-100 text-orange-800 border-orange-300',
    'doc__': 'bg-green-100 text-green-800 border-green-300',
  };

  const prefix = tabla.substring(0, 5);
  const color = colores[prefix] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <Badge variant="outline" className={color}>
      {tabla}
    </Badge>
  );
}

function JsonViewer({ data, title }: { data: Record<string, any> | null; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Sin datos
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span>{title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ExpandedRow({ auditoria }: { auditoria: Auditoria }) {
  return (
    <div className="p-4 bg-gray-50 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Información técnica */}
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700">IP:</span>
            <span className="ml-2 text-sm font-mono text-gray-600">{auditoria.ip}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">User Agent:</span>
            <p className="text-xs font-mono text-gray-600 mt-1 break-all">
              {auditoria.user_agent}
            </p>
          </div>
        </div>

        {/* ID de registro */}
        <div>
          <span className="text-sm font-medium text-gray-700">ID Registro:</span>
          <span className="ml-2 text-sm font-mono text-gray-900">
            {auditoria.registro_id || 'N/A'}
          </span>
        </div>
      </div>

      {/* Datos anteriores y nuevos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <JsonViewer data={auditoria.datos_anteriores} title="Datos Anteriores" />
        </div>
        <div>
          <JsonViewer data={auditoria.datos_nuevos} title="Datos Nuevos" />
        </div>
      </div>
    </div>
  );
}

export default function Index({ auditorias, filters, usuarios, tablas }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const columns: Column<Auditoria>[] = [
    {
      header: 'Fecha/Hora',
      render: (_, row) => (
        <div className="min-w-[140px]">
          <div className="text-sm font-medium">{formatDateTime(row.created_at)}</div>
        </div>
      ),
    },
    {
      header: 'Usuario',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.usuario.name}</div>
          <div className="text-xs text-muted-foreground">{row.usuario.email}</div>
        </div>
      ),
    },
    {
      header: 'Tabla',
      render: (_, row) => getTablaBadge(row.tabla),
    },
    {
      header: 'Registro ID',
      render: (_, row) => (
        <span className="font-mono text-sm">
          {row.registro_id || '-'}
        </span>
      ),
    },
    {
      header: 'Acción',
      render: (_, row) => getAccionBadge(row.accion),
    },
    {
      header: 'IP',
      render: (_, row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.ip}
        </span>
      ),
    },
    {
      header: 'Detalles',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRow(row.id)}
        >
          {expandedRows.has(row.id) ? (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ocultar
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              Ver
            </>
          )}
        </Button>
      ),
    },
  ];

  const filterDefinitions: Filter[] = [
    {
      name: 'usuario_id',
      label: 'Usuario',
      type: 'select',
      options: usuarios.map((usuario) => ({
        value: usuario.id.toString(),
        label: usuario.name,
      })),
    },
    {
      name: 'tabla',
      label: 'Tabla',
      type: 'select',
      options: tablas.map((tabla) => ({
        value: tabla,
        label: tabla,
      })),
    },
    {
      name: 'accion',
      label: 'Acción',
      type: 'select',
      options: [
        { value: 'create', label: 'Crear' },
        { value: 'update', label: 'Actualizar' },
        { value: 'delete', label: 'Eliminar' },
      ],
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

  // Renderizar filas con expansión
  const renderRows = () => {
    return auditorias.data.map((auditoria) => (
      <React.Fragment key={auditoria.id}>
        <tr className="border-b">
          {columns.map((column, index) => (
            <td key={index} className="px-4 py-3">
              {column.render ? column.render(null, auditoria) : null}
            </td>
          ))}
        </tr>
        {expandedRows.has(auditoria.id) && (
          <tr>
            <td colSpan={columns.length} className="p-0">
              <ExpandedRow auditoria={auditoria} />
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  };

  return (
    <CrudLayout
      title="Auditoría del Sistema"
      description="Consulta el historial completo de cambios en el sistema"
    >
      <Head title="Auditoría" />

      <DataTableAdvanced
        data={auditorias.data}
        columns={columns}
        pagination={{
          current_page: auditorias.current_page,
          from: 1,
          last_page: auditorias.last_page,
          path: route('config.auditoria.index'),
          per_page: auditorias.per_page,
          to: auditorias.data.length,
          total: auditorias.total,
          links: [],
        }}
        filters={filterDefinitions}
        currentFilters={filters}
        routeName="config.auditoria.index"
        searchPlaceholder="Buscar por registro ID o IP..."
        emptyMessage="No hay registros de auditoría"
        perPageOptions={[25, 50, 100]}
      />

      {/* Renderizar filas expandibles manualmente */}
      {expandedRows.size > 0 && (
        <div className="hidden">
          {/* Este div oculto asegura que el componente JsonViewer se renderice */}
        </div>
      )}
    </CrudLayout>
  );
}
