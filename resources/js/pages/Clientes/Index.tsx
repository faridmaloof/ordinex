import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';
import { MoneyDisplay } from '@/components/money-display';

interface Cliente {
    id: number;
    codigo: string;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    nombre_comercial: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    departamento: string;
    limite_credito: number;
    dias_credito: number;
    saldo_pendiente: number;
    saldo_favor: number;
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
            description: `¿Está seguro de eliminar "${item.razon_social}"? Esta acción no se puede deshacer.`,
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
            header: 'Código',
            accessor: 'codigo',
            className: 'w-24 font-mono',
        },
        {
            header: 'Cliente',
            accessor: 'razon_social',
            render: (value, row) => (
                <div>
                    <div className="font-medium">{value}</div>
                    {row.nombre_comercial && (
                        <div className="text-xs text-gray-500">{row.nombre_comercial}</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Documento',
            accessor: 'numero_documento',
            render: (value, row) => (
                <div className="text-sm">
                    <div>{row.tipo_documento}</div>
                    <div className="text-gray-600">{value}</div>
                </div>
            ),
        },
        {
            header: 'Contacto',
            render: (_, row) => (
                <div className="text-sm">
                    {row.telefono && <div>{row.telefono}</div>}
                    {row.email && <div className="text-gray-600">{row.email}</div>}
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
            header: 'Saldo Pendiente',
            accessor: 'saldo_pendiente',
            className: 'text-right',
            render: (value) => (
                <MoneyDisplay 
                    amount={value} 
                    colorize={value > 0}
                    className={value > 0 ? 'text-red-600 font-medium' : ''}
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
                    type="general" 
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
            show: (row) => row.saldo_pendiente === 0,
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
            name: 'tipo_documento',
            label: 'Tipo Documento',
            type: 'select',
            options: [
                { value: 'CI', label: 'Cédula de Identidad' },
                { value: 'NIT', label: 'NIT' },
                { value: 'RUC', label: 'RUC' },
                { value: 'PASAPORTE', label: 'Pasaporte' },
            ],
            placeholder: 'Todos',
        },
        {
            name: 'con_saldo',
            label: 'Con Saldo Pendiente',
            type: 'select',
            options: [
                { value: '1', label: 'Sí' },
                { value: '0', label: 'No' },
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
                searchPlaceholder="Buscar por código, documento, razón social..."
                searchFields={['código', 'documento', 'razón social', 'nombre comercial']}
                routeName="catalogos.clientes.index"
                emptyMessage="No se encontraron clientes"
            />

            {dialog}
        </CrudLayout>
    );
}