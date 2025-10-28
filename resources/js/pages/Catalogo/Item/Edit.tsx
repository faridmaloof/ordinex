import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, CategoriaItem, Item } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import FormField from '@/Components/FormField';
import TextareaField from '@/Components/TextareaField';
import SelectField from '@/Components/SelectField';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface EditItemProps extends PageProps {
    item: Item;
    categorias: CategoriaItem[];
}

export default function EditItem({ auth, item, categorias }: EditItemProps) {
    const { data, setData, patch, errors, processing } = useForm({
        codigo: item.codigo || '',
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        categoria_id: item.categoria_id || '',
        tipo: item.tipo || 'producto',
        unidad_medida: item.unidad_medida || 'unidad',
        precio_venta: item.precio_venta || 0,
        precio_costo: item.precio_costo || 0,
        aplica_iva: item.aplica_iva || false,
        porcentaje_iva: item.porcentaje_iva || 19,
        maneja_inventario: item.maneja_inventario || false,
        stock_minimo: item.stock_minimo || 0,
        activo: item.activo || false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('items.update', item.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Editar Item: {item.nombre}</h2>}
        >
            <Head title={`Editar ${item.nombre}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        id="codigo"
                                        label="Código"
                                        value={data.codigo}
                                        onChange={(e) => setData('codigo', e.target.value)}
                                        error={errors.codigo}
                                        required
                                    />
                                    <FormField
                                        id="nombre"
                                        label="Nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        error={errors.nombre}
                                        required
                                    />
                                </div>

                                <TextareaField
                                    id="descripcion"
                                    label="Descripción"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    error={errors.descripcion}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField
                                        id="categoria_id"
                                        label="Categoría"
                                        value={data.categoria_id.toString()}
                                        onChange={(e) => setData('categoria_id', e.target.value)}
                                        error={errors.categoria_id}
                                        options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
                                        required
                                    />
                                    <SelectField
                                        id="tipo"
                                        label="Tipo"
                                        value={data.tipo}
                                        onChange={(e) => setData('tipo', e.target.value)}
                                        error={errors.tipo}
                                        options={[
                                            { value: 'producto', label: 'Producto' },
                                            { value: 'servicio', label: 'Servicio' },
                                            { value: 'insumo', label: 'Insumo' },
                                        ]}
                                        required
                                    />
                                </div>

                                <div className="border-t pt-6">
                                    <h3 class="text-lg font-medium text-gray-900">Precios e Impuestos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                                        <FormField
                                            id="precio_venta"
                                            label="Precio de Venta"
                                            type="number"
                                            value={data.precio_venta}
                                            onChange={(e) => setData('precio_venta', parseFloat(e.target.value))}
                                            error={errors.precio_venta}
                                            required
                                        />
                                        <FormField
                                            id="precio_costo"
                                            label="Precio de Costo"
                                            type="number"
                                            value={data.precio_costo}
                                            onChange={(e) => setData('precio_costo', parseFloat(e.target.value))}
                                            error={errors.precio_costo}
                                        />
                                        <div className="flex items-center space-x-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="aplica_iva"
                                                checked={data.aplica_iva}
                                                onChange={(e) => setData('aplica_iva', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="aplica_iva" className="text-sm font-medium text-gray-700">Aplica IVA</label>
                                        </div>
                                        {data.aplica_iva && (
                                            <FormField
                                                id="porcentaje_iva"
                                                label="% IVA"
                                                type="number"
                                                value={data.porcentaje_iva}
                                                onChange={(e) => setData('porcentaje_iva', parseFloat(e.target.value))}
                                                error={errors.porcentaje_iva}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 class="text-lg font-medium text-gray-900">Inventario</h3>
                                    <p className="text-sm text-gray-500">El stock inicial no se puede editar. Use la opción de ajustar stock.</p>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="maneja_inventario"
                                            checked={data.maneja_inventario}
                                            onChange={(e) => setData('maneja_inventario', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="maneja_inventario" className="text-sm font-medium text-gray-700">Maneja Inventario</label>
                                    </div>
                                    {data.maneja_inventario && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <FormField
                                                id="stock_minimo"
                                                label="Stock Mínimo"
                                                type="number"
                                                value={data.stock_minimo}
                                                onChange={(e) => setData('stock_minimo', parseInt(e.target.value, 10))}
                                                error={errors.stock_minimo}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="activo"
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="activo" className="text-sm font-medium text-gray-700">Activo</label>
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Actualizando...' : 'Actualizar Item'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
