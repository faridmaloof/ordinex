import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/confirm-dialog';

interface Item {
    id: number;
    nombre: string;
    codigo: string;
    stock_actual: number;
}

interface CategoriaItem {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    activo: boolean;
    padre?: {
        id: number;
        nombre: string;
        codigo: string;
    };
    hijos?: Array<{
        id: number;
        nombre: string;
        codigo: string;
        items_count: number;
    }>;
    items?: Item[];
}

interface Props {
    categoria: CategoriaItem;
}

export default function Show({ categoria }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = () => {
        confirm({
            title: '¿Eliminar categoría?',
            description: `¿Está seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.categorias-items.destroy', categoria.id), {
                    onSuccess: () => {
                        router.visit(route('catalogos.categorias-items.index'));
                    },
                });
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Categoría: ${categoria.nombre}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('catalogos.categorias-items.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{categoria.nombre}</h1>
                                <Badge variant={categoria.activo ? 'default' : 'secondary'}>
                                    {categoria.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">Código: {categoria.codigo}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('catalogos.categorias-items.edit', categoria.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={(categoria.items?.length || 0) > 0 || (categoria.hijos?.length || 0) > 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Código</p>
                                <p className="font-mono text-lg">{categoria.codigo}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                <p className="text-lg">{categoria.nombre}</p>
                            </div>

                            {categoria.descripcion && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                                    <p className="text-sm">{categoria.descripcion}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                <Badge variant={categoria.activo ? 'default' : 'secondary'} className="mt-1">
                                    {categoria.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jerarquía */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Jerarquía</CardTitle>
                            <CardDescription>
                                Categorías padre e hijos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Categoría Padre */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Categoría Padre
                                </p>
                                {categoria.padre ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route('catalogos.categorias-items.show', categoria.padre.id)}>
                                            {categoria.padre.codigo} - {categoria.padre.nombre}
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Categoría raíz (sin padre)</p>
                                )}
                            </div>

                            {/* Subcategorías */}
                            {categoria.hijos && categoria.hijos.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Subcategorías ({categoria.hijos.length})
                                    </p>
                                    <div className="space-y-2">
                                        {categoria.hijos.map((hijo) => (
                                            <div
                                                key={hijo.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">{hijo.nombre}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hijo.codigo} • {hijo.items_count} items
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('catalogos.categorias-items.show', hijo.id)}>
                                                        Ver
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Items Asociados */}
                {categoria.items && categoria.items.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Items en esta categoría ({categoria.items.length})</CardTitle>
                            <CardDescription>
                                Productos y servicios asignados a esta categoría
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categoria.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{item.nombre}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.codigo} • Stock: {item.stock_actual}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('catalogos.items.show', item.id)}>Ver</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {dialog}
        </AppLayout>
    );
}
