import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, PaginatedResponse, Solicitud } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import MoneyDisplay from '@/Components/MoneyDisplay';
import EstadoBadge from '@/Components/EstadoBadge';
import Pagination from '@/Components/Pagination';

interface IndexSolicitudProps extends PageProps {
    solicitudes: PaginatedResponse<Solicitud>;
    filters: Record<string, string>;
}

export default function IndexSolicitud({ auth, solicitudes, filters }: IndexSolicitudProps) {
    // This would be a reusable hook for filtering
    const handleFilterChange = (key: string, value: string) => {
        router.get(route('solicitudes.index'), { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl">Solicitudes de Servicio</h2>
                    <Link href={route('solicitudes.create')}>
                        <Button>Crear Solicitud</Button>
                    </Link>
                </div>
            }
        >
            <Head title="Solicitudes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros</CardTitle>
                            {/* Filter components would go here */}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {solicitudes.data.map((solicitud) => (
                                        <TableRow key={solicitud.id}>
                                            <TableCell>{solicitud.numero}</TableCell>
                                            <TableCell>{solicitud.cliente.nombre}</TableCell>
                                            <TableCell>{new Date(solicitud.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell><EstadoBadge estado={solicitud.estado} /></TableCell>
                                            <TableCell><MoneyDisplay amount={solicitud.total} /></TableCell>
                                            <TableCell>
                                                <Link href={route('solicitudes.show', solicitud.id)}>
                                                    <Button variant="outline" size="sm">Ver</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination links={solicitudes.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
