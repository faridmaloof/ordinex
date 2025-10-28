import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Item } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import EstadoBadge from '@/Components/EstadoBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';

interface ShowItemProps extends PageProps {
    item: Item;
}

const DataField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-lg text-gray-900">{value}</p>
    </div>
);

export default function ShowItem({ auth, item }: ShowItemProps) {
    // TODO: Implement useConfirmDialog and AjustarStockModal
    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este item?')) {
            // router.delete(route('items.destroy', item.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Detalle del Item</h2>
                    <div className="space-x-2">
                        <Button variant="outline">Ajustar Stock</Button>
                        <Link href={route('items.edit', item.id)}>
                            <Button>Editar</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={item.nombre} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{item.nombre}</CardTitle>
                            <EstadoBadge estado={item.activo ? 'Activo' : 'Inactivo'} />
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DataField label="Código" value={item.codigo} />
                            <DataField label="Categoría" value={item.categoria?.nombre || 'N/A'} />
                            <DataField label="Tipo" value={item.tipo} />
                            <div className="md:col-span-3">
                                <DataField label="Descripción" value={item.descripcion || '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Precios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <DataField label="Precio de Venta" value={<MoneyDisplay amount={item.precio_venta} />} />
                                <DataField label="Precio de Costo" value={<MoneyDisplay amount={item.precio_costo} />} />
                                <DataField label="Aplica IVA" value={item.aplica_iva ? `Sí (${item.porcentaje_iva}%)` : 'No'} />
                            </CardContent>
                        </Card>

                        {item.maneja_inventario && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información de Inventario</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <DataField label="Stock Actual" value={item.stock_actual} />
                                    <DataField label="Stock Mínimo" value={item.stock_minimo} />
                                    <DataField label="Unidad de Medida" value={item.unidad_medida} />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end">
                         <Button variant="destructive" onClick={handleDelete}>Eliminar Item</Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
