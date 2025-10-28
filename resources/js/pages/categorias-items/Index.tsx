import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfirmDialog } from '@/components/confirm-dialog';

interface CategoriaItem {
    id: number;
    nombre: string;
    codigo: string;
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
}

export default function Index({ categorias }: Props) {
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

    const columns = [
        {
            header: 'Código',
            accessor: 'codigo',
            render: (value: string) => (
                <span className="font-mono text-sm">{value}</span>
            ),
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (_: string, categoria: CategoriaItem) => (
                <div>
                    <div className="font-medium">{categoria.nombre}</div>
                    {categoria.padre && (
                        <div className="text-sm text-muted-foreground">
                            Padre: {categoria.padre.nombre}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Descripción',
            accessor: 'descripcion',
            render: (value: string | undefined) => (
                <span className="text-sm text-muted-foreground line-clamp-2">
                    {value || '-'}
                </span>
            ),
        },
        {
            header: 'Items',
            accessor: 'items_count',
            render: (value: number) => (
                <Badge variant="secondary">{value}</Badge>
            ),
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (value: boolean) => (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'id',
            render: (_: number, categoria: CategoriaItem) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Ver detalle"
                    >
                        <Link href={route('catalogos.categorias-items.show', categoria.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Editar"
                    >
                        <Link href={route('catalogos.categorias-items.edit', categoria.id)}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(categoria)}
                        disabled={categoria.items_count > 0}
                        title={
                            categoria.items_count > 0
                                ? 'No se puede eliminar: tiene items asignados'
                                : 'Eliminar'
                        }
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Categorías de Items" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categorías de Items</h1>
                        <p className="text-muted-foreground">
                            Gestión de categorías para organizar el inventario
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('catalogos.categorias-items.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
                        </Link>
                    </Button>
                </div>

                <DataTable columns={columns} data={categorias.data} pagination={categorias} />
            </div>

            {dialog}
        </AppLayout>
    );
}
