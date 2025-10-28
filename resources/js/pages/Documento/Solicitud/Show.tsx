import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Solicitud } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import EstadoBadge from '@/Components/EstadoBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface ShowSolicitudProps extends PageProps {
    solicitud: Solicitud;
}

const DataField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-lg text-gray-900">{value}</p>
    </div>
);

export default function ShowSolicitud({ auth, solicitud }: ShowSolicitudProps) {

    const canEdit = ['borrador', 'pendiente'].includes(solicitud.estado);
    const canDelete = solicitud.estado === 'borrador';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl">Solicitud: {solicitud.numero}</h2>
                    <div className="space-x-2">
                        {/* Workflow action buttons would go here */}
                        {canEdit && (
                            <Link href={route('solicitudes.edit', solicitud.id)}>
                                <Button>Editar</Button>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Solicitud ${solicitud.numero}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Información General</CardTitle>
                            <EstadoBadge estado={solicitud.estado} />
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DataField label="Cliente" value={solicitud.cliente.nombre} />
                            <DataField label="Fecha" value={new Date(solicitud.fecha).toLocaleDateString()} />
                            <DataField label="Fecha Entrega" value={solicitud.fecha_entrega_estimada ? new Date(solicitud.fecha_entrega_estimada).toLocaleDateString() : 'N/A'} />
                            <div className="md:col-span-3">
                                <DataField label="Observaciones" value={solicitud.observaciones || '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Items de la Solicitud</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio Unit.</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {solicitud.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.item.nombre}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell><MoneyDisplay amount={item.precio_unitario} /></TableCell>
                                            <TableCell><MoneyDisplay amount={item.subtotal} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-right">
                            <div className="flex justify-between"><p>Subtotal:</p><MoneyDisplay amount={solicitud.subtotal} /></div>
                            <div className="flex justify-between"><p>IVA:</p><MoneyDisplay amount={solicitud.iva} /></div>
                            <div className="flex justify-between font-bold text-lg"><p>Total:</p><MoneyDisplay amount={solicitud.total} /></div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
