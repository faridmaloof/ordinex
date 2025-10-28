import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';
import { MoneyDisplay } from '@/components/money-display';

interface Cliente {
    id: number;
    erp_id: string | null;
    tipo_cliente: 'natural' | 'juridico';
    tipo_documento: string;
    numero_documento: string;
    nombre: string;
    telefono: string | null;
    celular: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    departamento: string | null;
    vendedor_id: number | null;
    vendedor?: {
        id: number;
        nombre: string;
    };
    limite_credito: number;
    saldo_favor: number;
    sincronizado_erp: boolean;
    activo: boolean;
}

interface Props {
    clientes: {
        data: Cliente[];
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
}

export default function Index({ clientes, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (item: Cliente) => {
        confirm({
            title: '¿Eliminar cliente?',
            description: `¿Está seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.clientes.destroy', item.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    const columns: Column<Cliente>[] = [
        {
            header: 'Tipo',
            accessor: 'tipo_cliente',
            className: 'w-24',
            render: (value) => (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    value === 'juridico' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                }`}>
                    {value === 'juridico' ? 'Jurídico' : 'Natural'}
                </span>
            ),
        },
        {
            header: 'Cliente',
            accessor: 'nombre',
            render: (value, row) => (
                <div>
                    <div className="font-medium">{value}</div>
                    {row.erp_id && (
                        <div className="text-xs text-gray-500">
                            ERP: {row.erp_id}
                            {row.sincronizado_erp && (
                                <span className="ml-1 text-green-600">●</span>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Documento',
            accessor: 'numero_documento',
            render: (value, row) => (
                <div className="text-sm">
                    <div className="font-mono">{row.tipo_documento}</div>
                    <div className="text-gray-600">{value}</div>
                </div>
            ),
        },
        {
            header: 'Contacto',
            render: (_, row) => (
                <div className="text-sm">
                    {row.telefono && <div>{row.telefono}</div>}
                    {row.celular && <div className="text-gray-500">{row.celular}</div>}
                    {row.email && <div className="text-gray-600 truncate max-w-[200px]">{row.email}</div>}
                </div>
            ),
        },
        {
            header: 'Ubicación',
            render: (_, row) => (
                <div className="text-sm">
                    {row.ciudad && <div>{row.ciudad}</div>}
                    {row.departamento && <div className="text-gray-600">{row.departamento}</div>}
                </div>
            ),
        },
        {
            header: 'Vendedor',
            render: (_, row) => (
                row.vendedor ? (
                    <div className="text-sm text-gray-700">{row.vendedor.nombre}</div>
                ) : (
                    <span className="text-xs text-gray-400">Sin asignar</span>
                )
            ),
        },
        {
            header: 'Saldo Favor',
            accessor: 'saldo_favor',
            className: 'text-right',
            render: (value) => (
                <MoneyDisplay 
                    amount={value} 
                    colorized={value > 0}
                    className={value > 0 ? 'text-green-600 font-medium' : ''}
                />
            ),
        },
        {
            header: 'Estado',
            accessor: 'activo',
            className: 'text-center',
            render: (value) => (
                <EstadoBadge 
                    estado={value ? 'activo' : 'inactivo'} 
                />
            ),
        },
    ];

    const actions: Action<Cliente>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.clientes.show', row.id),
            permission: 'clientes.view',
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.clientes.edit', row.id),
            permission: 'clientes.update',
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            onClick: handleDelete,
            permission: 'clientes.delete',
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        },
    ];

    const filterDefinitions: Filter[] = [
        {
            name: 'activo',
            label: 'Estado',
            type: 'select',
            options: [
                { value: '1', label: 'Activo' },
                { value: '0', label: 'Inactivo' },
            ],
            placeholder: 'Todos',
        },
        {
            name: 'tipo_cliente',
            label: 'Tipo Cliente',
            type: 'select',
            options: [
                { value: 'natural', label: 'Natural' },
                { value: 'juridico', label: 'Jurídico' },
            ],
            placeholder: 'Todos',
        },
        {
            name: 'tipo_documento',
            label: 'Tipo Documento',
            type: 'select',
            options: [
                { value: 'CC', label: 'CC' },
                { value: 'NIT', label: 'NIT' },
                { value: 'CE', label: 'CE' },
                { value: 'Pasaporte', label: 'Pasaporte' },
            ],
            placeholder: 'Todos',
        },
        {
            name: 'con_saldo_favor',
            label: 'Con Saldo a Favor',
            type: 'select',
            options: [
                { value: '1', label: 'Sí' },
            ],
            placeholder: 'Todos',
        },
    ];

    return (
        <CrudLayout
            title="Clientes"
            description="Administra los registros de clientes"
            createRoute={route('catalogos.clientes.create')}
            createLabel="Nuevo Cliente"
            createPermission="clientes.create"
        >
            <DataTableAdvanced
                data={clientes.data}
                columns={columns}
                actions={actions}
                pagination={clientes}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                searchPlaceholder="Buscar por documento, nombre, email..."
                searchFields={['documento', 'nombre', 'email']}
                routeName="catalogos.clientes.index"
                emptyMessage="No se encontraron clientes"
            />

            {dialog}
        </CrudLayout>
    );
}