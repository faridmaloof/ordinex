import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, Package } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/money-display';
import { useConfirmDialog } from '@/components/confirm-dialog';

interface Item {
    id: number;
    codigo: string;
    nombre: string;
    tipo: 'producto' | 'servicio';
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    categoria?: { id: number; nombre: string };
    activo: boolean;
}

interface Props {
    items: {
        data: Item[];
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

export default function Index({ items }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (item: Item) => {
        confirm({
            title: '¿Eliminar item?',
            description: `¿Está seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.items.destroy', item.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    const columns = [
        {
            header: 'Código',
            accessor: 'codigo',
            render: (value: string) => <span className="font-mono text-sm">{value}</span>,
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (_: string, item: Item) => (
                <div>
                    <div className="font-medium">{item.nombre}</div>
                    {item.categoria && (
                        <div className="text-sm text-muted-foreground">{item.categoria.nombre}</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Tipo',
            accessor: 'tipo',
            render: (value: string) => (
                <Badge variant="outline">
                    {value === 'producto' ? 'Producto' : 'Servicio'}
                </Badge>
            ),
        },
        {
            header: 'Precio',
            accessor: 'precio_venta',
            render: (value: number) => <MoneyDisplay amount={value} />,
        },
        {
            header: 'Stock',
            accessor: 'stock_actual',
            render: (value: number, item: Item) => (
                <div className="flex items-center gap-2">
                    <Badge variant={value <= item.stock_minimo ? 'destructive' : 'secondary'}>
                        {value}
                    </Badge>
                    {value <= item.stock_minimo && (
                        <span className="text-xs text-destructive">Bajo</span>
                    )}
                </div>
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
            render: (_: number, item: Item) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild title="Ver detalle">
                        <Link href={route('catalogos.items.show', item.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild title="Editar">
                        <Link href={route('catalogos.items.edit', item.id)}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        title="Eliminar"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Items" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
                        <p className="text-muted-foreground">
                            Gestión de productos y servicios del inventario
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('catalogos.items.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Item
                        </Link>
                    </Button>
                </div>

                <DataTable columns={columns} data={items.data} pagination={items} />
            </div>

            {dialog}
        </AppLayout>
    );
}
