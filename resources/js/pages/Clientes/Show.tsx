import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoneyDisplay } from '@/components/money-display';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { ArrowLeft, Pencil, Trash2, FileText, Briefcase } from 'lucide-react';
import { Can } from '@/hooks/usePermissions';

interface Solicitud {
    id: number;
    numero: string;
    fecha: string;
    estado: string;
    total: number;
}

interface OrdenServicio {
    id: number;
    numero: string;
    fecha: string;
    estado: string;
    total: number;
}

interface Cliente {
    id: number;
    erp_id: string | null;
    tipo_cliente: 'natural' | 'juridico';
    tipo_documento: string;
    numero_documento: string;
    nombre: string;
    telefono: string | null;
    celular: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    departamento: string | null;
    vendedor_id: number | null;
    vendedor?: {
        id: number;
        nombre: string;
    };
    limite_credito: number;
    saldo_favor: number;
    sincronizado_erp: boolean;
    activo: boolean;
    observaciones: string | null;
    solicitudes?: Solicitud[];
    ordenes_servicio?: OrdenServicio[];
}

interface Props {
    cliente: Cliente;
}

export default function Show({ cliente }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = () => {
        confirm({
            title: '¿Eliminar cliente?',
            description: `¿Está seguro de eliminar "${cliente.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.clientes.destroy', cliente.id));
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Cliente: ${cliente.nombre}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-semibold text-2xl text-gray-900">
                                {cliente.nombre}
                            </h2>
                            <Badge variant={cliente.tipo_cliente === 'natural' ? 'default' : 'secondary'}>
                                {cliente.tipo_cliente === 'natural' ? 'Natural' : 'Jurídico'}
                            </Badge>
                            <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                                {cliente.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {cliente.sincronizado_erp && cliente.erp_id && (
                                <Badge variant="outline" className="text-blue-600">
                                    ERP: {cliente.erp_id}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {cliente.tipo_documento}: {cliente.numero_documento}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('catalogos.clientes.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <Can permission="clientes.update">
                            <Link href={route('catalogos.clientes.edit', cliente.id)}>
                                <Button variant="outline">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </Can>
                        <Can permission="clientes.delete">
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                        </Can>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500">Tipo:</span>
                                <p className="font-medium">
                                    {cliente.tipo_cliente === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
                                </p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500">Documento:</span>
                                <p className="font-medium">
                                    {cliente.tipo_documento}: {cliente.numero_documento}
                                </p>
                            </div>

                            {cliente.erp_id && (
                                <div>
                                    <span className="text-sm text-gray-500">Código ERP:</span>
                                    <p className="font-medium">
                                        {cliente.erp_id}
                                        {cliente.sincronizado_erp && (
                                            <span className="ml-2 text-blue-600 text-sm">✓ Sincronizado</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {cliente.vendedor && (
                                <div>
                                    <span className="text-sm text-gray-500">Vendedor Asignado:</span>
                                    <p className="font-medium">{cliente.vendedor.nombre}</p>
                                </div>
                            )}

                            <div>
                                <span className="text-sm text-gray-500">Estado:</span>
                                <p className="font-medium">
                                    {cliente.activo ? 'Activo' : 'Inactivo'}
                                </p>
                            </div>

                            {cliente.observaciones && (
                                <div>
                                    <span className="text-sm text-gray-500">Observaciones:</span>
                                    <p className="text-sm text-gray-700">{cliente.observaciones}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contacto */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {cliente.telefono && (
                                <div>
                                    <span className="text-sm text-gray-500">Teléfono:</span>
                                    <p className="font-medium">{cliente.telefono}</p>
                                </div>
                            )}

                            {cliente.celular && (
                                <div>
                                    <span className="text-sm text-gray-500">Celular:</span>
                                    <p className="font-medium">{cliente.celular}</p>
                                </div>
                            )}

                            {cliente.email && (
                                <div>
                                    <span className="text-sm text-gray-500">Email:</span>
                                    <p className="font-medium">{cliente.email}</p>
                                </div>
                            )}

                            {cliente.direccion && (
                                <div>
                                    <span className="text-sm text-gray-500">Dirección:</span>
                                    <p className="font-medium">{cliente.direccion}</p>
                                </div>
                            )}

                            {(cliente.ciudad || cliente.departamento) && (
                                <div>
                                    <span className="text-sm text-gray-500">Ubicación:</span>
                                    <p className="font-medium">
                                        {[cliente.ciudad, cliente.departamento]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Estado de Crédito */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Comercial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500">Límite de Crédito:</span>
                                <MoneyDisplay amount={cliente.limite_credito} className="text-lg font-semibold" />
                            </div>

                            {cliente.saldo_favor > 0 && (
                                <div>
                                    <span className="text-sm text-gray-500">Saldo a Favor:</span>
                                    <MoneyDisplay 
                                        amount={cliente.saldo_favor} 
                                        className="text-lg font-semibold text-green-600"
                                    />
                                </div>
                            )}

                            {cliente.vendedor && (
                                <div>
                                    <span className="text-sm text-gray-500">Vendedor:</span>
                                    <p className="font-medium">{cliente.vendedor.nombre}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen de Actividad */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de Actividad</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">Solicitudes:</span>
                                </div>
                                <span className="font-semibold">
                                    {cliente.solicitudes?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">Órdenes de Servicio:</span>
                                </div>
                                <span className="font-semibold">
                                    {cliente.ordenes_servicio?.length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Solicitudes Recientes */}
                {cliente.solicitudes && cliente.solicitudes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitudes Recientes</CardTitle>
                            <CardDescription>
                                Últimas solicitudes registradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {cliente.solicitudes.slice(0, 5).map((solicitud) => (
                                    <div
                                        key={solicitud.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium">{solicitud.numero}</p>
                                            <p className="text-sm text-gray-500">{solicitud.fecha}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge>{solicitud.estado}</Badge>
                                            <MoneyDisplay amount={solicitud.total} />
                                            <Link href={route('documentos.solicitudes.show', solicitud.id)}>
                                                <Button variant="ghost" size="sm">
                                                    Ver
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Órdenes de Servicio Recientes */}
                {cliente.ordenes_servicio && cliente.ordenes_servicio.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes de Servicio Recientes</CardTitle>
                            <CardDescription>
                                Últimas órdenes de servicio
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {cliente.ordenes_servicio.slice(0, 5).map((orden) => (
                                    <div
                                        key={orden.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium">{orden.numero}</p>
                                            <p className="text-sm text-gray-500">{orden.fecha}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge>{orden.estado}</Badge>
                                            <MoneyDisplay amount={orden.total} />
                                            <Link href={route('documentos.ordenes-servicio.show', orden.id)}>
                                                <Button variant="ghost" size="sm">
                                                    Ver
                                                </Button>
                                            </Link>
                                        </div>
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
