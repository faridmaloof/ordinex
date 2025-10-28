import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Check, X } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';
import { Badge } from '@/components/ui/badge';

interface FormaPago {
    id: number;
    codigo: string;
    nombre: string;
    requiere_referencia: boolean;
    requiere_autorizacion: boolean;
    activo: boolean;
    orden: number;
    pagos_count?: number;
}

interface Props {
    formasPago: {
        data: FormaPago[];
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

export default function Index({ formasPago, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (item: FormaPago) => {
        confirm({
            title: '¿Eliminar forma de pago?',
            description: `¿Está seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.formas-pago.destroy', item.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    const columns: Column<FormaPago>[] = [
        {
            header: 'Código',
            accessor: 'codigo',
            className: 'w-24 font-mono',
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (value) => (
                <div className="font-medium">{value}</div>
            ),
        },
        {
            header: 'Requiere Referencia',
            accessor: 'requiere_referencia',
            className: 'text-center',
            render: (value) => (
                value ? 
                    <Check className="h-4 w-4 text-green-600 mx-auto" /> : 
                    <X className="h-4 w-4 text-gray-300 mx-auto" />
            ),
        },
        {
            header: 'Requiere Autorización',
            accessor: 'requiere_autorizacion',
            className: 'text-center',
            render: (value) => (
                value ? 
                    <Check className="h-4 w-4 text-green-600 mx-auto" /> : 
                    <X className="h-4 w-4 text-gray-300 mx-auto" />
            ),
        },
        {
            header: 'Orden',
            accessor: 'orden',
            className: 'text-center w-20',
            render: (value) => (
                <Badge variant="outline">{value}</Badge>
            ),
        },
        {
            header: 'Estado',
            accessor: 'activo',
            className: 'text-center',
            render: (value) => (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
    ];

    const actions: Action<FormaPago>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.formas-pago.show', row.id),
            permission: 'formas_pago.view',
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.formas-pago.edit', row.id),
            permission: 'formas_pago.update',
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            onClick: handleDelete,
            permission: 'formas_pago.delete',
            show: (row) => (row.pagos_count || 0) === 0,
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
            name: 'requiere_referencia',
            label: 'Requiere Referencia',
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
            title="Formas de Pago"
            description="Administra las formas de pago disponibles"
            createRoute={route('catalogos.formas-pago.create')}
            createLabel="Nueva Forma de Pago"
            createPermission="formas_pago.create"
        >
            <DataTableAdvanced
                data={formasPago.data}
                columns={columns}
                actions={actions}
                pagination={formasPago}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                searchPlaceholder="Buscar por código o nombre..."
                searchFields={['código', 'nombre']}
                routeName="catalogos.formas-pago.index"
                emptyMessage="No se encontraron formas de pago"
            />

            {dialog}
        </CrudLayout>
    );
}
