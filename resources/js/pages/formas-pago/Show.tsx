import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { ArrowLeft, Pencil, Trash2, Check, X } from 'lucide-react';
import { Can } from '@/hooks/usePermissions';

interface FormaPago {
    id: number;
    codigo: string;
    nombre: string;
    requiere_referencia: boolean;
    requiere_autorizacion: boolean;
    activo: boolean;
    orden: number;
    pagos_count?: number;
}

interface Props {
    formaPago: FormaPago;
}

export default function Show({ formaPago }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = () => {
        confirm({
            title: '¿Eliminar forma de pago?',
            description: `¿Está seguro de eliminar "${formaPago.nombre}"? Esta acción no se puede deshacer.`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('catalogos.formas-pago.destroy', formaPago.id));
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Forma de Pago: ${formaPago.nombre}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-semibold text-2xl text-gray-900">
                                {formaPago.nombre}
                            </h2>
                            <Badge variant={formaPago.activo ? 'default' : 'secondary'}>
                                {formaPago.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Código: {formaPago.codigo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('catalogos.formas-pago.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <Can permission="formas_pago.update">
                            <Link href={route('catalogos.formas-pago.edit', formaPago.id)}>
                                <Button variant="outline">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </Can>
                        <Can permission="formas_pago.delete">
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={(formaPago.pagos_count || 0) > 0}
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
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500">Código:</span>
                                <p className="font-medium font-mono">{formaPago.codigo}</p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500">Nombre:</span>
                                <p className="font-medium">{formaPago.nombre}</p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500">Orden de visualización:</span>
                                <p className="font-medium">
                                    <Badge variant="outline">{formaPago.orden}</Badge>
                                </p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500">Estado:</span>
                                <p className="font-medium">
                                    {formaPago.activo ? 'Activo' : 'Inactivo'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Requiere referencia:</span>
                                <div className="flex items-center gap-2">
                                    {formaPago.requiere_referencia ? (
                                        <>
                                            <Check className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-600">Sí</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-5 w-5 text-gray-400" />
                                            <span className="font-medium text-gray-600">No</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Requiere autorización:</span>
                                <div className="flex items-center gap-2">
                                    {formaPago.requiere_autorizacion ? (
                                        <>
                                            <Check className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-600">Sí</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-5 w-5 text-gray-400" />
                                            <span className="font-medium text-gray-600">No</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {(formaPago.pagos_count || 0) > 0 && (
                                <div className="pt-4 border-t">
                                    <span className="text-sm text-gray-500">Pagos registrados:</span>
                                    <p className="font-semibold text-lg">{formaPago.pagos_count}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Información adicional */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-600 space-y-2">
                            {formaPago.requiere_referencia && (
                                <p>• Esta forma de pago requiere ingresar un número de referencia (ej: número de transacción, cheque).</p>
                            )}
                            {formaPago.requiere_autorizacion && (
                                <p>• Esta forma de pago requiere autorización externa antes de completarse.</p>
                            )}
                            {(formaPago.pagos_count || 0) > 0 && (
                                <p className="text-amber-600">⚠️ No se puede eliminar esta forma de pago porque tiene pagos registrados.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {dialog}
        </AppLayout>
    );
}
