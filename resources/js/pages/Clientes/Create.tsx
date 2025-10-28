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
        erp_id: '',
        tipo_cliente: 'natural',
        tipo_documento: 'CC',
        numero_documento: '',
        nombre: '',
        telefono: '',
        celular: '',
        email: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        vendedor_id: '',
        limite_credito: '0',
        activo: true,
        observaciones: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('catalogos.clientes.store'), {
            preserveScroll: true,
        });
    };

    const tiposCliente = [
        { value: 'natural', label: 'Persona Natural' },
        { value: 'juridico', label: 'Persona Jurídica' },
    ];

    const tiposDocumento = [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'NIT', label: 'NIT' },
        { value: 'CE', label: 'Cédula de Extranjería' },
        { value: 'Pasaporte', label: 'Pasaporte' },
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
                                <SelectField
                                    label="Tipo de Cliente"
                                    name="tipo_cliente"
                                    value={data.tipo_cliente}
                                    onChange={(value) => setData('tipo_cliente', value)}
                                    options={tiposCliente}
                                    error={errors.tipo_cliente}
                                    required
                                    helpText="Seleccione si es persona natural o jurídica"
                                />

                                <FormField
                                    label="ERP ID"
                                    name="erp_id"
                                    value={data.erp_id}
                                    onChange={(e) => setData('erp_id', e.target.value)}
                                    error={errors.erp_id}
                                    placeholder="ID en sistema ERP (opcional)"
                                    helpText="Si existe en SaiOpen ERP"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
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
                                    maxLength={20}
                                />
                            </div>

                            <FormField
                                label={data.tipo_cliente === 'juridico' ? 'Razón Social' : 'Nombre Completo'}
                                name="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                required
                                helpText={
                                    data.tipo_cliente === 'juridico' 
                                        ? 'Nombre legal de la empresa' 
                                        : 'Nombre completo de la persona'
                                }
                            />
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
                                    placeholder="Ej: 3001234567"
                                    maxLength={20}
                                />

                                <FormField
                                    label="Celular"
                                    name="celular"
                                    type="tel"
                                    value={data.celular}
                                    onChange={(e) => setData('celular', e.target.value)}
                                    error={errors.celular}
                                    placeholder="Ej: 3101234567"
                                    maxLength={20}
                                />
                            </div>

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="cliente@ejemplo.com"
                            />

                            <FormField
                                label="Dirección"
                                name="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                                placeholder="Dirección completa del cliente"
                            />

                            <div className="grid gap-4 md:grid-cols-2">
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crédito y Vendedor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración Comercial</CardTitle>
                            <CardDescription>
                                Vendedor asignado y límite de crédito
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Vendedor ID"
                                    name="vendedor_id"
                                    type="number"
                                    value={data.vendedor_id}
                                    onChange={(e) => setData('vendedor_id', e.target.value)}
                                    error={errors.vendedor_id}
                                    helpText="ID del vendedor asignado (opcional)"
                                />

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
