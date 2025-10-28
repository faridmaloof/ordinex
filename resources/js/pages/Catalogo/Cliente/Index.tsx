import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DataTable, { type Column, type PaginationMeta } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Cliente {
    id: number;
    codigo: string;
    numero_documento: string;
    razon_social: string;
    nombre_comercial: string | null;
    telefono: string | null;
    email: string | null;
    limite_credito: number;
    saldo_pendiente: number;
    activo: boolean;
    created_at: string;
}

interface ClientesData {
    data: Cliente[];
    links: any;
    meta: any;
}

interface Props {
    clientes: ClientesData;
    filtros: {
        buscar?: string;
        activo?: boolean;
    };
}

export default function ClientesIndex({ clientes, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar || '');

    const handleBuscar = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('catalogo.clientes.index'),
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (cliente: Cliente) => {
        if (
            confirm(
                `¿Está seguro de eliminar el cliente "${cliente.razon_social}"?`
            )
        ) {
            router.delete(route('catalogo.clientes.destroy', cliente.id), {
                preserveScroll: true,
            });
        }
    };

    const columns: Column<Cliente>[] = [
        {
            header: 'Código',
            accessor: 'codigo',
            className: 'font-medium',
        },
        {
            header: 'Documento',
            accessor: 'numero_documento',
        },
        {
            header: 'Razón Social',
            accessor: 'razon_social',
        },
        {
            header: 'Teléfono',
            accessor: 'telefono',
            render: (value) => value || '-',
        },
        {
            header: 'Límite Crédito',
            accessor: 'limite_credito',
            render: (value) => `$${parseFloat(value).toLocaleString('es-CO')}`,
            className: 'text-right',
        },
        {
            header: 'Saldo Pendiente',
            accessor: 'saldo_pendiente',
            render: (value) => {
                const saldo = parseFloat(value);
                return (
                    <span className={saldo > 0 ? 'text-red-600 font-medium' : ''}>
                        ${saldo.toLocaleString('es-CO')}
                    </span>
                );
            },
            className: 'text-right',
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (value) => (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'id',
            render: (_, cliente) => (
                <div className="flex items-center gap-2">
                    <Link href={route('catalogo.clientes.show', cliente.id)}>
                        <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={route('catalogo.clientes.edit', cliente.id)}>
                        <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cliente)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Clientes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                        <p className="text-muted-foreground">
                            Gestión de clientes del sistema
                        </p>
                    </div>
                    <Link href={route('catalogo.clientes.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="rounded-lg border bg-card p-4">
                    <form onSubmit={handleBuscar} className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por código, documento, razón social..."
                                    value={buscar}
                                    onChange={(e) => setBuscar(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button type="submit">Buscar</Button>
                        {filtros.buscar && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setBuscar('');
                                    router.get(route('catalogo.clientes.index'));
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </form>
                </div>

                {/* Tabla */}
                <DataTable
                    columns={columns}
                    data={clientes.data}
                    pagination={clientes.meta}
                />
            </div>
        </AppLayout>
    );
}
