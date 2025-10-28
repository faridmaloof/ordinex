import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, Package, TrendingUp, TrendingDown } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Filter, Action } from '@/components/DataTable/DataTableAdvanced';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useConfirmDialog } from '@/components/confirm-dialog';

interface Categoria {
    id: number;
    nombre: string;
    color?: string;
}

interface Item {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    tipo: 'producto' | 'servicio';
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    categoria?: Categoria;
    activo: boolean;
}

interface Props {
    items: {
        data: Item[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        activo?: string;
        categoria_id?: string;
        tipo?: string;
    };
    categorias: Categoria[];
}

interface AjusteStockForm {
    tipo_movimiento: 'ingreso' | 'egreso';
    cantidad: string;
    motivo: string;
}

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(amount);
}

// Modal de Ajuste de Stock
function AjustarStockModal({
    item,
    isOpen,
    onClose
}: {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<AjusteStockForm>({
        tipo_movimiento: 'ingreso',
        cantidad: '',
        motivo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;

        post(route('catalogos.items.ajustar-stock', item.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!item) return null;

    const stockResultante = data.tipo_movimiento === 'ingreso'
        ? item.stock_actual + (parseInt(data.cantidad) || 0)
        : item.stock_actual - (parseInt(data.cantidad) || 0);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajustar Stock</DialogTitle>
                    <DialogDescription>
                        Item: <strong>{item.nombre}</strong> (Código: {item.codigo})
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stock Actual */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-center">
                            <p className="text-sm text-blue-700">Stock Actual</p>
                            <p className="text-3xl font-bold text-blue-900">{item.stock_actual}</p>
                            <p className="text-xs text-blue-600 mt-1">unidades</p>
                        </div>
                    </div>

                    {/* Tipo de Movimiento */}
                    <div>
                        <Label className="mb-3 block">
                            Tipo de Movimiento <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            value={data.tipo_movimiento}
                            onValueChange={(value: 'ingreso' | 'egreso') => setData('tipo_movimiento', value)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2 flex-1">
                                <div className="relative flex items-center space-x-2 border-2 border-green-200 rounded-lg p-3 hover:bg-green-50 transition-colors cursor-pointer has-[:checked]:border-green-600 has-[:checked]:bg-green-50">
                                    <RadioGroupItem value="ingreso" id="ingreso-stock" />
                                    <Label htmlFor="ingreso-stock" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-900">Ingreso</span>
                                    </Label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                                <div className="relative flex items-center space-x-2 border-2 border-red-200 rounded-lg p-3 hover:bg-red-50 transition-colors cursor-pointer has-[:checked]:border-red-600 has-[:checked]:bg-red-50">
                                    <RadioGroupItem value="egreso" id="egreso-stock" />
                                    <Label htmlFor="egreso-stock" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-semibold text-red-900">Egreso</span>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                        {errors.tipo_movimiento && (
                            <p className="text-sm text-red-600 mt-2">{errors.tipo_movimiento}</p>
                        )}
                    </div>

                    {/* Cantidad */}
                    <div>
                        <Label htmlFor="cantidad">
                            Cantidad <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={data.cantidad}
                            onChange={(e) => setData('cantidad', e.target.value)}
                            className="mt-2"
                            placeholder="0"
                        />
                        {errors.cantidad && (
                            <p className="text-sm text-red-600 mt-1">{errors.cantidad}</p>
                        )}
                    </div>

                    {/* Stock Resultante */}
                    {data.cantidad && (
                        <div className={`border-2 rounded-lg p-3 ${
                            stockResultante < 0
                                ? 'bg-red-50 border-red-300'
                                : stockResultante <= item.stock_minimo
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-green-50 border-green-300'
                        }`}>
                            <div className="text-center">
                                <p className="text-sm font-medium">Stock Resultante</p>
                                <p className={`text-2xl font-bold ${
                                    stockResultante < 0
                                        ? 'text-red-600'
                                        : stockResultante <= item.stock_minimo
                                            ? 'text-yellow-600'
                                            : 'text-green-600'
                                }`}>
                                    {stockResultante}
                                </p>
                                {stockResultante < 0 && (
                                    <p className="text-xs text-red-600 mt-1">⚠️ Stock negativo no permitido</p>
                                )}
                                {stockResultante > 0 && stockResultante <= item.stock_minimo && (
                                    <p className="text-xs text-yellow-700 mt-1">⚠️ Por debajo del stock mínimo</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Motivo */}
                    <div>
                        <Label htmlFor="motivo">
                            Motivo <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="motivo"
                            value={data.motivo}
                            onChange={(e) => setData('motivo', e.target.value)}
                            rows={3}
                            className="mt-2"
                            placeholder="Explica el motivo del ajuste (mínimo 10 caracteres)..."
                        />
                        {errors.motivo && (
                            <p className="text-sm text-red-600 mt-1">{errors.motivo}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.motivo.length}/10 caracteres mínimos
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.cantidad ||
                                data.motivo.length < 10 ||
                                stockResultante < 0
                            }
                            className={data.tipo_movimiento === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {processing ? 'Ajustando...' : 'Confirmar Ajuste'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function Index({ items, filters, categorias }: Props) {
    const { confirm, dialog } = useConfirmDialog();
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [showAjustarModal, setShowAjustarModal] = useState(false);

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

    const handleAjustarStock = (item: Item) => {
        setSelectedItem(item);
        setShowAjustarModal(true);
    };

    const columns: Column<Item>[] = [
        {
            header: 'Código',
            render: (_, row) => (
                <span className="font-mono text-sm">{row.codigo}</span>
            ),
        },
        {
            header: 'Nombre',
            render: (_, row) => (
                <div>
                    <div className="font-medium">{row.nombre}</div>
                    {row.categoria && (
                        <Badge
                            variant="outline"
                            className="mt-1"
                            style={{
                                backgroundColor: row.categoria.color ? `${row.categoria.color}20` : undefined,
                                borderColor: row.categoria.color || undefined,
                                color: row.categoria.color || undefined
                            }}
                        >
                            {row.categoria.nombre}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            header: 'Tipo',
            render: (_, row) => (
                <Badge variant="outline">
                    {row.tipo === 'producto' ? 'Producto' : 'Servicio'}
                </Badge>
            ),
        },
        {
            header: 'Precio',
            render: (_, row) => (
                <span className="font-semibold">{formatMoney(row.precio_venta)}</span>
            ),
        },
        {
            header: 'Stock',
            render: (_, row) => {
                if (row.tipo === 'servicio') {
                    return <span className="text-muted-foreground text-sm">N/A</span>;
                }

                const color = row.stock_actual <= 0
                    ? 'bg-red-600'
                    : row.stock_actual <= row.stock_minimo
                        ? 'bg-yellow-600'
                        : 'bg-green-600';

                return (
                    <div className="flex items-center gap-2">
                        <Badge className={color}>
                            {row.stock_actual}
                        </Badge>
                        {row.stock_actual <= row.stock_minimo && (
                            <span className="text-xs text-red-600 font-medium">Bajo</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Estado',
            render: (_, row) => (
                <Badge variant={row.activo ? 'default' : 'secondary'} className={row.activo ? 'bg-green-600' : ''}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
    ];

    const actions: Action<Item>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            href: (row) => route('catalogos.items.show', row.id),
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            href: (row) => route('catalogos.items.edit', row.id),
            permission: 'items.update',
        },
        {
            label: 'Ajustar Stock',
            icon: <Package className="h-4 w-4" />,
            variant: 'ghost',
            onClick: (row) => handleAjustarStock(row),
            show: (row) => row.tipo === 'producto',
            permission: 'items.ajustar_stock',
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            onClick: (row) => handleDelete(row),
            permission: 'items.delete',
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
        },
        {
            name: 'categoria_id',
            label: 'Categoría',
            type: 'select',
            options: categorias.map((cat) => ({
                value: cat.id.toString(),
                label: cat.nombre,
            })),
        },
        {
            name: 'tipo',
            label: 'Tipo',
            type: 'select',
            options: [
                { value: 'producto', label: 'Producto' },
                { value: 'servicio', label: 'Servicio' },
            ],
        },
    ];

    return (
        <CrudLayout
            title="Items"
            description="Gestión de productos y servicios del inventario"
            createRoute="catalogos.items.create"
            createLabel="Nuevo Item"
        >
            <Head title="Items" />

            <DataTableAdvanced
                data={items.data}
                columns={columns}
                actions={actions}
                pagination={{
                    current_page: items.current_page,
                    from: 1,
                    last_page: items.last_page,
                    path: route('catalogos.items.index'),
                    per_page: items.per_page,
                    to: items.data.length,
                    total: items.total,
                    links: [],
                }}
                filters={filterDefinitions}
                currentFilters={filters}
                routeName="catalogos.items.index"
                searchPlaceholder="Buscar por código o nombre..."
                emptyMessage="No hay items registrados"
            />

            {/* Modal de Ajustar Stock */}
            <AjustarStockModal
                item={selectedItem}
                isOpen={showAjustarModal}
                onClose={() => {
                    setShowAjustarModal(false);
                    setSelectedItem(null);
                }}
            />

            {dialog}
        </CrudLayout>
    );
}
