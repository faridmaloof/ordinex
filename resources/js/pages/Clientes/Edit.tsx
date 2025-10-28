import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/form-field';
import { SelectField } from '@/components/select-field';
import { TextareaField } from '@/components/textarea-field';
import { ArrowLeft } from 'lucide-react';

interface Cliente {
    id: number;
    codigo: string;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    nombre_comercial: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    departamento: string;
    pais: string;
    limite_credito: number;
    dias_credito: number;
    activo: boolean;
    observaciones: string;
}

interface Props {
    cliente: Cliente;
}

export default function Edit({ cliente }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        codigo: cliente.codigo || '',
        tipo_documento: cliente.tipo_documento,
        numero_documento: cliente.numero_documento,
        razon_social: cliente.razon_social,
        nombre_comercial: cliente.nombre_comercial || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        departamento: cliente.departamento || '',
        pais: cliente.pais,
        limite_credito: String(cliente.limite_credito),
        dias_credito: String(cliente.dias_credito),
        activo: cliente.activo,
        observaciones: cliente.observaciones || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('catalogos.clientes.update', cliente.id), {
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
            <Head title={`Editar Cliente: ${cliente.razon_social}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl text-gray-900">
                            Editar Cliente
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {cliente.razon_social}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('codigo', e.target.value.toUpperCase())}
                                    error={errors.codigo}
                                    placeholder="Ej: CLI-001"
                                    disabled
                                    helpText="El código no se puede modificar"
                                />

                                <div className="grid gap-4 grid-cols-2">
                                    <SelectField
                                        label="Tipo Documento"
                                        name="tipo_documento"
                                        value={data.tipo_documento}
                                        onChange={(value: string) => setData('tipo_documento', value)}
                                        options={tiposDocumento}
                                        error={errors.tipo_documento}
                                        required
                                    />
                                    <FormField
                                        label="Número Documento"
                                        name="numero_documento"
                                        value={data.numero_documento}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('numero_documento', e.target.value)}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('razon_social', e.target.value)}
                                    error={errors.razon_social}
                                    required
                                    helpText="Nombre legal del cliente"
                                />

                                <FormField
                                    label="Nombre Comercial"
                                    name="nombre_comercial"
                                    value={data.nombre_comercial}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nombre_comercial', e.target.value)}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('telefono', e.target.value)}
                                    error={errors.telefono}
                                    placeholder="Ej: +591 2 1234567"
                                />

                                <FormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="cliente@ejemplo.com"
                                />
                            </div>

                            <FormField
                                label="Dirección"
                                name="direccion"
                                value={data.direccion}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                                placeholder="Dirección completa del cliente"
                            />

                            <div className="grid gap-4 md:grid-cols-3">
                                <FormField
                                    label="Ciudad"
                                    name="ciudad"
                                    value={data.ciudad}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('ciudad', e.target.value)}
                                    error={errors.ciudad}
                                />

                                <FormField
                                    label="Departamento"
                                    name="departamento"
                                    value={data.departamento}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('departamento', e.target.value)}
                                    error={errors.departamento}
                                />

                                <FormField
                                    label="País"
                                    name="pais"
                                    value={data.pais}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('pais', e.target.value)}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('limite_credito', e.target.value)}
                                    error={errors.limite_credito}
                                    helpText="Monto máximo de crédito permitido"
                                />

                                <FormField
                                    label="Días de Crédito"
                                    name="dias_credito"
                                    type="number"
                                    min="0"
                                    value={data.dias_credito}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('dias_credito', e.target.value)}
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
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('observaciones', e.target.value)}
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
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
