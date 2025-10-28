import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, CategoriaItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import FormField from '@/Components/FormField';
import TextareaField from '@/Components/TextareaField';
import SelectField from '@/Components/SelectField';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface CreateItemProps extends PageProps {
    categorias: CategoriaItem[];
}

export default function CreateItem({ auth, categorias }: CreateItemProps) {
    const { data, setData, post, errors, processing } = useForm({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria_id: '',
        tipo: 'producto',
        unidad_medida: 'unidad',
        precio_venta: 0,
        precio_costo: 0,
        aplica_iva: false,
        porcentaje_iva: 19,
        maneja_inventario: true,
        stock_inicial: 0,
        stock_minimo: 0,
        activo: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('items.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Crear Nuevo Item</h2>}
        >
            <Head title="Crear Item" />

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
                                        value={data.categoria_id}
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
                                                id="stock_inicial"
                                                label="Stock Inicial"
                                                type="number"
                                                value={data.stock_inicial}
                                                onChange={(e) => setData('stock_inicial', parseInt(e.target.value, 10))}
                                                error={errors.stock_inicial}
                                            />
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
                                        {processing ? 'Guardando...' : 'Guardar Item'}
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
