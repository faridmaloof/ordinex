import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';

// 📝 TODO: Ajusta esta interfaz según tu modelo
interface FormasPago {
    id: number;
    nombre: string;
    // Agrega más campos según tu modelo
}

interface Props {
    formasPagos: {
        data: FormasPago[];
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

export default function Index({ formasPagos, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (item: FormasPago) => {
        confirm({
            title: '¿Eliminar registro?',
            description: \`¿Está seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.\`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.formas-pago.destroy', item.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    // 📝 TODO: Personaliza las columnas según tus necesidades
    const columns: Column<FormasPago>[] = [
        {
            header: 'ID',
            accessor: 'id',
            className: 'w-20',
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (value) => (
                <div className="font-medium">{value}</div>
            ),
        },
        // 📝 TODO: Agrega más columnas aquí
    ];

    // 📝 TODO: Personaliza las acciones disponibles
    const actions: Action<FormasPago>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.formas-pago.show', row.id),
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('catalogos.formas-pago.edit', row.id),
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            onClick: handleDelete,
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        },
        // 📝 TODO: Agrega acciones personalizadas aquí
        // Ejemplo:
        // {
        //     label: 'Acción Custom',
        //     icon: <RefreshCw className="h-4 w-4" />,
        //     variant: 'outline',
        //     onClick: (row) => {
        //         router.post(route('catalogos.formas-pago.custom-action', row.id));
        //     },
        //     show: (row) => row.some_condition, // Opcional
        // },
    ];

    // 📝 TODO: Configura los filtros según tus necesidades
    const filterDefinitions: Filter[] = [
        // Ejemplo de filtro select:
        // {
        //     name: 'status',
        //     label: 'Estado',
        //     type: 'select',
        //     options: [
        //         { value: 'active', label: 'Activo' },
        //         { value: 'inactive', label: 'Inactivo' },
        //     ],
        //     placeholder: 'Todos',
        // },
        // Ejemplo de filtro de fecha:
        // {
        //     name: 'fecha_desde',
        //     label: 'Desde',
        //     type: 'date',
        // },
    ];

    return (
        <CrudLayout
            title="FormasPagos"
            description="Administra los registros de formasPagos"
            createRoute={route('catalogos.formas-pago.create')}
            createLabel="Nuevo FormasPago"
        >
            <DataTableAdvanced
                data={formasPagos.data}
                columns={columns}
                actions={actions}
                pagination={formasPagos}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                searchPlaceholder="Buscar..."
                searchFields={['nombre']} // 📝 TODO: Ajusta los campos de búsqueda
                routeName="catalogos.formas-pago.index"
                emptyMessage="No se encontraron registros"
            />

            {dialog}
        </CrudLayout>
    );
}