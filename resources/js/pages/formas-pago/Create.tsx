import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/form-field';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        nombre: '',
        requiere_referencia: false,
        requiere_autorizacion: false,
        activo: true,
        orden: '1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('catalogos.formas-pago.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Nueva Forma de Pago" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl text-gray-900">
                            Nueva Forma de Pago
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Registra una nueva forma de pago en el sistema
                        </p>
                    </div>
                    <Link href={route('catalogos.formas-pago.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Forma de Pago</CardTitle>
                            <CardDescription>
                                Configura los datos de la forma de pago
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Código"
                                    name="codigo"
                                    value={data.codigo}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('codigo', e.target.value.toUpperCase())}
                                    error={errors.codigo}
                                    placeholder="Ej: EFEC, TARJ, TRANS"
                                    required
                                    helpText="Código único corto"
                                />

                                <FormField
                                    label="Orden"
                                    name="orden"
                                    type="number"
                                    min="1"
                                    value={data.orden}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('orden', e.target.value)}
                                    error={errors.orden}
                                    helpText="Orden de visualización"
                                />
                            </div>

                            <FormField
                                label="Nombre"
                                name="nombre"
                                value={data.nombre}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                placeholder="Ej: Efectivo, Tarjeta de Crédito"
                                required
                            />

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="requiere_referencia"
                                        type="checkbox"
                                        checked={data.requiere_referencia}
                                        onChange={(e) => setData('requiere_referencia', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <label htmlFor="requiere_referencia" className="text-sm font-medium text-gray-700">
                                            Requiere referencia
                                        </label>
                                        <p className="text-xs text-gray-500">Número de transacción, cheque, etc.</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="requiere_autorizacion"
                                        type="checkbox"
                                        checked={data.requiere_autorizacion}
                                        onChange={(e) => setData('requiere_autorizacion', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <label htmlFor="requiere_autorizacion" className="text-sm font-medium text-gray-700">
                                            Requiere autorización
                                        </label>
                                        <p className="text-xs text-gray-500">Se validará con entidad externa</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="activo"
                                        type="checkbox"
                                        checked={data.activo}
                                        onChange={(e) => setData('activo', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                                        Forma de pago activa
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('catalogos.formas-pago.index')}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Crear Forma de Pago'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
