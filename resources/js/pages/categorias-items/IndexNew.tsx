import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';

interface CategoriaItem {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    padre?: {
        id: number;
        nombre: string;
    };
    items_count: number;
    activo: boolean;
}

interface Props {
    categorias: {
        data: CategoriaItem[];
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

export default function Index({ categorias, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (categoria: CategoriaItem) => {
        confirm({
            title: '¿Eliminar categoría?',
            description: `¿Está seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.categorias-items.destroy', categoria.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    // Definición de columnas
    const columns: Column<CategoriaItem>[] = [
        {
            header: 'Código',
            accessor: 'codigo',
            className: 'font-mono',
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (value, row) => (
                <div>
                    <div className="font-medium">{value}</div>
                    {row.padre && (
                        <div className="text-xs text-gray-500">
                            Padre: {row.padre.nombre}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Descripción',
            accessor: 'descripcion',
            render: (value) => (
                <span className="text-sm text-gray-600">
                    {value || '-'}
                </span>
            ),
        },
        {
            header: 'Items',
            accessor: 'items_count',
            render: (value) => (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                    {value}
                </span>
            ),
            className: 'text-center',
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (value) => (
                <EstadoBadge estado={value ? 'activo' : 'inactivo'} />
            ),
            className: 'text-center',
        },
    ];

    // Definición de acciones
    const actions: Action<CategoriaItem>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.categorias-items.show', row.id),
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.categorias-items.edit', row.id),
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            onClick: handleDelete,
            show: (row) => row.items_count === 0, // Solo permitir eliminar si no tiene items
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        },
    ];

    // Definición de filtros
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
    ];

    return (
        <CrudLayout
            title="Categorías de Items"
            description="Administra las categorías para organizar tus items"
            createRoute={route('catalogos.categorias-items.create')}
            createLabel="Nueva Categoría"
        >
            <DataTableAdvanced
                data={categorias.data}
                columns={columns}
                actions={actions}
                pagination={categorias}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                searchPlaceholder="Buscar por código o nombre..."
                searchFields={['código', 'nombre', 'descripción']}
                routeName="catalogos.categorias-items.index"
                emptyMessage="No se encontraron categorías"
            />

            {dialog}
        </CrudLayout>
    );
}
