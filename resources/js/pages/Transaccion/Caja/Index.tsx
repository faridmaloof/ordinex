import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, CajaConfig } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import EstadoBadge from '@/Components/EstadoBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';

interface CajaIndexProps extends PageProps {
    cajasConfig: (CajaConfig & {
        caja_abierta: null | {
            id: number;
            usuario_cajero: { nombre: string };
            saldo_final_sistema: number;
        };
    })[];
}

export default function CajaIndex({ auth, cajasConfig }: CajaIndexProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl">Dashboard de Cajas</h2>}
        >
            <Head title="Dashboard de Cajas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cajasConfig.map((caja) => (
                            <Card key={caja.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>{caja.nombre}</CardTitle>
                                    <EstadoBadge estado={caja.caja_abierta ? 'Abierta' : 'Cerrada'} />
                                </CardHeader>
                                <CardContent>
                                    {caja.caja_abierta ? (
                                        <div className="space-y-2">
                                            <p>Abierta por: <span className="font-semibold">{caja.caja_abierta.usuario_cajero.nombre}</span></p>
                                            <p>Saldo Sistema: <MoneyDisplay amount={caja.caja_abierta.saldo_final_sistema} /></p>
                                        </div>
                                    ) : (
                                        <p>Esta caja está actualmente cerrada.</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    {caja.caja_abierta ? (
                                        <Link href={route('caja.actual')} className="w-full">
                                            <Button className="w-full">Ir a Caja</Button>
                                        </Link>
                                    ) : (
                                        <Link href={route('caja.abrirForm')} className="w-full">
                                            <Button variant="outline" className="w-full">Abrir Caja</Button>
                                        </Link>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
