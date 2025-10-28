import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/form-field';
import { SelectField } from '@/components/select-field';
import { TextareaField } from '@/components/textarea-field';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        tipo_documento: 'CI',
        numero_documento: '',
        razon_social: '',
        nombre_comercial: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        pais: 'Bolivia',
        limite_credito: '0',
        dias_credito: '0',
        activo: true,
        observaciones: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('catalogos.clientes.store'), {
            preserveScroll: true,
        });
    };

    const tiposDocumento = [
        { value: 'CI', label: 'Cédula de Identidad' },
        { value: 'NIT', label: 'NIT' },
        { value: 'RUC', label: 'RUC' },
        { value: 'PASAPORTE', label: 'Pasaporte' },
        { value: 'OTRO', label: 'Otro' },
    ];

    return (
        <AppLayout>
            <Head title="Nuevo Cliente" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl text-gray-900">
                            Nuevo Cliente
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Registra un nuevo cliente en el sistema
                        </p>
                    </div>
                    <Link href={route('catalogos.clientes.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                            <CardDescription>
                                Datos principales del cliente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Código"
                                    name="codigo"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                    error={errors.codigo}
                                    placeholder="Ej: CLI-001"
                                    helpText="Código único del cliente (opcional, se genera automáticamente)"
                                />

                                <div className="grid gap-4 grid-cols-2">
                                    <SelectField
                                        label="Tipo Documento"
                                        name="tipo_documento"
                                        value={data.tipo_documento}
                                        onChange={(value) => setData('tipo_documento', value)}
                                        options={tiposDocumento}
                                        error={errors.tipo_documento}
                                        required
                                    />
                                    <FormField
                                        label="Número Documento"
                                        name="numero_documento"
                                        value={data.numero_documento}
                                        onChange={(e) => setData('numero_documento', e.target.value)}
                                        error={errors.numero_documento}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Razón Social"
                                    name="razon_social"
                                    value={data.razon_social}
                                    onChange={(e) => setData('razon_social', e.target.value)}
                                    error={errors.razon_social}
                                    required
                                    helpText="Nombre legal del cliente"
                                />

                                <FormField
                                    label="Nombre Comercial"
                                    name="nombre_comercial"
                                    value={data.nombre_comercial}
                                    onChange={(e) => setData('nombre_comercial', e.target.value)}
                                    error={errors.nombre_comercial}
                                    helpText="Nombre con el que se le conoce (opcional)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contacto */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                            <CardDescription>
                                Datos para comunicación con el cliente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Teléfono"
                                    name="telefono"
                                    type="tel"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    error={errors.telefono}
                                    placeholder="Ej: +591 2 1234567"
                                />

                                <FormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="cliente@ejemplo.com"
                                />
                            </div>

                            <FormField
                                label="Dirección"
                                name="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                                placeholder="Dirección completa del cliente"
                            />

                            <div className="grid gap-4 md:grid-cols-3">
                                <FormField
                                    label="Ciudad"
                                    name="ciudad"
                                    value={data.ciudad}
                                    onChange={(e) => setData('ciudad', e.target.value)}
                                    error={errors.ciudad}
                                />

                                <FormField
                                    label="Departamento"
                                    name="departamento"
                                    value={data.departamento}
                                    onChange={(e) => setData('departamento', e.target.value)}
                                    error={errors.departamento}
                                />

                                <FormField
                                    label="País"
                                    name="pais"
                                    value={data.pais}
                                    onChange={(e) => setData('pais', e.target.value)}
                                    error={errors.pais}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crédito */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Crédito</CardTitle>
                            <CardDescription>
                                Límites y términos de crédito para el cliente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Límite de Crédito"
                                    name="limite_credito"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.limite_credito}
                                    onChange={(e) => setData('limite_credito', e.target.value)}
                                    error={errors.limite_credito}
                                    helpText="Monto máximo de crédito permitido"
                                />

                                <FormField
                                    label="Días de Crédito"
                                    name="dias_credito"
                                    type="number"
                                    min="0"
                                    value={data.dias_credito}
                                    onChange={(e) => setData('dias_credito', e.target.value)}
                                    error={errors.dias_credito}
                                    helpText="Plazo en días para pago a crédito"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="activo"
                                    type="checkbox"
                                    checked={data.activo}
                                    onChange={(e) => setData('activo', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                                    Cliente activo
                                </label>
                            </div>

                            <TextareaField
                                label="Observaciones"
                                name="observaciones"
                                value={data.observaciones}
                                onChange={(e) => setData('observaciones', e.target.value)}
                                error={errors.observaciones}
                                rows={3}
                                placeholder="Notas adicionales sobre el cliente..."
                            />
                        </CardContent>
                    </Card>

                    {/* Botones */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('catalogos.clientes.index')}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Crear Cliente'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
