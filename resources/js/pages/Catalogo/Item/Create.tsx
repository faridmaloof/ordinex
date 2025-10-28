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
        erp_id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria_id: '',
        categoria_erp: '',
        tipo: 'producto',
        unidad_medida: 'unidad',
        precio_base: 0,
        precio_venta: 0,
        iva: 19.00,
        imagen: '',
        maneja_inventario: true,
        stock_inicial: 0,
        stock_minimo: 0,
        tiempo_estimado_servicio: '',
        permite_edicion: true,
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
                                {/* Información Básica */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        id="codigo"
                                        label="Código"
                                        value={data.codigo}
                                        onChange={(e) => setData('codigo', e.target.value)}
                                        error={errors.codigo}
                                        required
                                    />
                                    <FormField
                                        id="erp_id"
                                        label="Código ERP"
                                        value={data.erp_id}
                                        onChange={(e) => setData('erp_id', e.target.value)}
                                        error={errors.erp_id}
                                        helpText="Código del sistema ERP (opcional)"
                                    />
                                    <FormField
                                        id="categoria_erp"
                                        label="Categoría ERP"
                                        value={data.categoria_erp}
                                        onChange={(e) => setData('categoria_erp', e.target.value)}
                                        error={errors.categoria_erp}
                                        helpText="Categoría del sistema ERP (opcional)"
                                    />
                                </div>

                                <FormField
                                    id="nombre"
                                    label="Nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    error={errors.nombre}
                                    required
                                />

                                <TextareaField
                                    id="descripcion"
                                    label="Descripción"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    error={errors.descripcion}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <SelectField
                                        id="unidad_medida"
                                        label="Unidad de Medida"
                                        value={data.unidad_medida}
                                        onChange={(e) => setData('unidad_medida', e.target.value)}
                                        error={errors.unidad_medida}
                                        options={[
                                            { value: 'unidad', label: 'Unidad' },
                                            { value: 'hora', label: 'Hora' },
                                            { value: 'metro', label: 'Metro' },
                                            { value: 'litro', label: 'Litro' },
                                            { value: 'kilogramo', label: 'Kilogramo' },
                                        ]}
                                        required
                                    />
                                </div>

                                {/* Tiempo estimado si es servicio */}
                                {data.tipo === 'servicio' && (
                                    <FormField
                                        id="tiempo_estimado_servicio"
                                        label="Tiempo Estimado"
                                        value={data.tiempo_estimado_servicio}
                                        onChange={(e) => setData('tiempo_estimado_servicio', e.target.value)}
                                        error={errors.tiempo_estimado_servicio}
                                        helpText="Ej: 2 horas, 1 día, etc."
                                    />
                                )}

                                {/* Precios e Impuestos */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Precios e Impuestos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            id="precio_base"
                                            label="Precio Base"
                                            type="number"
                                            step="0.01"
                                            value={data.precio_base}
                                            onChange={(e) => setData('precio_base', parseFloat(e.target.value))}
                                            error={errors.precio_base}
                                            required
                                            helpText="Precio sin IVA"
                                        />
                                        <FormField
                                            id="precio_venta"
                                            label="Precio de Venta"
                                            type="number"
                                            step="0.01"
                                            value={data.precio_venta}
                                            onChange={(e) => setData('precio_venta', parseFloat(e.target.value))}
                                            error={errors.precio_venta}
                                            required
                                            helpText="Precio final al público"
                                        />
                                        <FormField
                                            id="iva"
                                            label="IVA %"
                                            type="number"
                                            step="0.01"
                                            value={data.iva}
                                            onChange={(e) => setData('iva', parseFloat(e.target.value))}
                                            error={errors.iva}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Inventario</h3>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="maneja_inventario"
                                            checked={data.maneja_inventario}
                                            onChange={(e) => setData('maneja_inventario', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="maneja_inventario" className="text-sm font-medium text-gray-700">
                                            Maneja Inventario
                                        </label>
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

                                {/* Imagen y configuración */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen y Configuración</h3>
                                    <div className="space-y-4">
                                        <FormField
                                            id="imagen"
                                            label="URL de Imagen"
                                            value={data.imagen}
                                            onChange={(e) => setData('imagen', e.target.value)}
                                            error={errors.imagen}
                                            helpText="URL de la imagen del item (opcional)"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="permite_edicion"
                                                checked={data.permite_edicion}
                                                onChange={(e) => setData('permite_edicion', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="permite_edicion" className="text-sm font-medium text-gray-700">
                                                Permite Edición
                                            </label>
                                            <span className="text-sm text-gray-500">
                                                (Items sincronizados con ERP no deberían ser editables)
                                            </span>
                                        </div>
                                    </div>
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
