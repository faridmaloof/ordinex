import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T = any> {
    header: string;
    accessor: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLinks[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface DataTableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    pagination?: PaginationMeta;
    loading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T = any>({
    columns,
    data,
    pagination,
    loading = false,
    emptyMessage = 'No hay datos para mostrar',
}: DataTableProps<T>) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center py-8"
                                >
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex} className={column.className}>
                                            {column.render
                                                ? column.render(
                                                      (row as any)[column.accessor],
                                                      row
                                                  )
                                                : (row as any)[column.accessor]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{pagination.from}</span> a{' '}
                        <span className="font-medium">{pagination.to}</span> de{' '}
                        <span className="font-medium">{pagination.total}</span> resultados
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Botón Anterior */}
                        {pagination.links[0]?.url ? (
                            <Link href={pagination.links[0].url} preserveState>
                                <Button variant="outline" size="sm">
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                        )}

                        {/* Números de página */}
                        <div className="hidden sm:flex space-x-1">
                            {pagination.links.slice(1, -1).map((link, index) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={index}
                                            className="px-3 py-2 text-sm text-muted-foreground"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                return (
                                    <Link key={index} href={link.url!} preserveState>
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                        >
                                            {link.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Botón Siguiente */}
                        {pagination.links[pagination.links.length - 1]?.url ? (
                            <Link
                                href={pagination.links[pagination.links.length - 1].url!}
                                preserveState
                            >
                                <Button variant="outline" size="sm">
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
