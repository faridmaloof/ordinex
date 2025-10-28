import { ReactNode, useState } from 'react';
import { router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

export interface Column<T> {
    header: string;
    accessor?: keyof T | ((row: T) => any);
    render?: (value: any, row: T) => ReactNode;
    sortable?: boolean;
    className?: string;
}

export interface Action<T> {
    label: string;
    icon?: ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    onClick?: (row: T) => void;
    href?: (row: T) => string;
    show?: (row: T) => boolean;
    permission?: string; // Permiso requerido para mostrar la acción
    className?: string;
}

export interface Filter {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'daterange';
    options?: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface DataTableAdvancedProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    pagination: PaginationMeta;
    filters?: Filter[];
    currentFilters?: Record<string, any>;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: string[];
    perPageOptions?: number[];
    routeName: string;
    emptyMessage?: string;
    className?: string;
}

export default function DataTableAdvanced<T extends { id: number | string }>({
    data,
    columns,
    actions = [],
    pagination,
    filters = [],
    currentFilters = {},
    searchable = true,
    searchPlaceholder = 'Buscar...',
    searchFields = [],
    perPageOptions = [5, 10, 20, 50, 100],
    routeName,
    emptyMessage = 'No hay registros disponibles',
    className,
}: DataTableAdvancedProps<T>) {
    const [localFilters, setLocalFilters] = useState<Record<string, any>>(currentFilters);
    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const { hasPermission } = usePermissions();

    // Función para actualizar filtros sin recargar la página
    const updateFilters = (newFilters: Record<string, any>, resetPage = false) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );

        if (resetPage) {
            delete cleanFilters.page;
        }

        router.get(
            route(routeName),
            cleanFilters,
            {
                preserveState: true,
                preserveScroll: true,
                only: ['data', 'pagination', 'filters'], // Solo actualizar data, no toda la página
            }
        );
    };

    // Manejar búsqueda con debounce
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const newFilters = { ...localFilters, search: value };
        setLocalFilters(newFilters);

        // Debounce de 500ms
        const timeoutId = setTimeout(() => {
            updateFilters(newFilters, true);
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    // Manejar cambio de filtro
    const handleFilterChange = (name: string, value: any) => {
        const newFilters = { ...localFilters, [name]: value };
        setLocalFilters(newFilters);
        updateFilters(newFilters, true);
    };

    // Manejar cambio de registros por página
    const handlePerPageChange = (value: string) => {
        const newFilters = { ...localFilters, per_page: value };
        setLocalFilters(newFilters);
        updateFilters(newFilters, true);
    };

    // Manejar paginación
    const handlePageChange = (page: number) => {
        const newFilters = { ...localFilters, page };
        setLocalFilters(newFilters);
        updateFilters(newFilters);
    };

    // Limpiar todos los filtros
    const clearFilters = () => {
        setSearchTerm('');
        setLocalFilters({});
        updateFilters({}, true);
    };

    // Obtener valor de celda
    const getCellValue = (row: T, column: Column<T>) => {
        if (column.render) {
            const value = typeof column.accessor === 'function'
                ? column.accessor(row)
                : column.accessor
                    ? row[column.accessor]
                    : null;
            return column.render(value, row);
        }

        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }

        return column.accessor ? row[column.accessor] : null;
    };

    const hasActiveFilters = Object.keys(localFilters).some(
        key => key !== 'page' && key !== 'per_page' && localFilters[key]
    );

    return (
        <div className={cn('space-y-4', className)}>
            {/* Barra de búsqueda y filtros */}
            {(searchable || filters.length > 0) && (
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1 flex flex-col gap-4 md:flex-row">
                        {/* Búsqueda */}
                        {searchable && (
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                                {searchFields.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Busca en: {searchFields.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Filtros personalizados */}
                        {filters.map((filter) => (
                            <div key={filter.name} className={cn('flex-1 max-w-xs', filter.className)}>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    {filter.label}
                                </label>
                                {filter.type === 'select' ? (
                                    <Select
                                        value={localFilters[filter.name] || ''}
                                        onValueChange={(value) => handleFilterChange(filter.name, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={filter.placeholder || 'Seleccionar...'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            {filter.options?.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : filter.type === 'date' ? (
                                    <Input
                                        type="date"
                                        value={localFilters[filter.name] || ''}
                                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        placeholder={filter.placeholder}
                                        value={localFilters[filter.name] || ''}
                                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            )}

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {actions.length > 0 && (
                                <TableHead className="text-right">Acciones</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                                    className="h-24 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex} className={column.className}>
                                            {getCellValue(row, column)}
                                        </TableCell>
                                    ))}
                                    {actions.length > 0 && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions.map((action, actionIndex) => {
                                                    // Verificar permisos
                                                    if (action.permission && !hasPermission(action.permission)) {
                                                        return null;
                                                    }

                                                    // Verificar si la acción debe mostrarse
                                                    if (action.show && !action.show(row)) {
                                                        return null;
                                                    }

                                                    // Si tiene href, usar Link de Inertia
                                                    if (action.href) {
                                                        return (
                                                            <Button
                                                                key={actionIndex}
                                                                variant={action.variant || 'outline'}
                                                                size={action.size || 'sm'}
                                                                className={action.className}
                                                                onClick={() => {
                                                                    if (action.onClick) {
                                                                        action.onClick(row);
                                                                    } else {
                                                                        router.visit(action.href!(row));
                                                                    }
                                                                }}
                                                            >
                                                                {action.icon && <span className="mr-1">{action.icon}</span>}
                                                                {action.label}
                                                            </Button>
                                                        );
                                                    }

                                                    // Acción con onClick
                                                    return (
                                                        <Button
                                                            key={actionIndex}
                                                            variant={action.variant || 'outline'}
                                                            size={action.size || 'sm'}
                                                            className={action.className}
                                                            onClick={() => action.onClick?.(row)}
                                                        >
                                                            {action.icon && <span className="mr-1">{action.icon}</span>}
                                                            {action.label}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{pagination.from || 0}</span> a{' '}
                        <span className="font-medium">{pagination.to || 0}</span> de{' '}
                        <span className="font-medium">{pagination.total}</span> registros
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={String(pagination.per_page)} onValueChange={handlePerPageChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option} / pág
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(1)}
                            disabled={pagination.current_page === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="mx-2 text-sm text-gray-700">
                            Página {pagination.current_page} de {pagination.last_page}
                        </span>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(pagination.last_page)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
