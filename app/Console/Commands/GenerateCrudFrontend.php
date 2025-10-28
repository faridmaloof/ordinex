<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateCrudFrontend extends Command
{
    protected $signature = 'make:crud-frontend {name} {--model=} {--route-prefix=}';
    protected $description = 'Genera el frontend estandarizado para un CRUD';

    public function handle()
    {
        $name = $this->argument('name');
        $model = $this->option('model') ?? $name;
        $routePrefix = $this->option('route-prefix') ?? Str::kebab(Str::plural($name));

        $this->info("Generando frontend CRUD para: {$name}");

        // Crear el archivo Index.tsx
        $this->generateIndexFile($name, $model, $routePrefix);

        $this->info("✓ Archivo Index.tsx generado exitosamente");
        $this->info("  → resources/js/pages/{$name}/Index.tsx");
        $this->newLine();
        $this->info("Siguiente paso: Personaliza las columnas, acciones y filtros en el archivo generado");
    }

    protected function generateIndexFile($name, $model, $routePrefix)
    {
        $pluralName = Str::plural($name);
        $variableName = Str::camel($pluralName);
        $modelName = Str::studly(Str::singular($name));
        
        $template = <<<TYPESCRIPT
import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';

// 📝 TODO: Ajusta esta interfaz según tu modelo
interface {$modelName} {
    id: number;
    nombre: string;
    // Agrega más campos según tu modelo
}

interface Props {
    {$variableName}: {
        data: {$modelName}[];
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    filters: Record<string, any>;
}

export default function Index({ {$variableName}, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    const handleDelete = (item: {$modelName}) => {
        confirm({
            title: '¿Eliminar registro?',
            description: \`¿Está seguro de eliminar "\${item.nombre}"? Esta acción no se puede deshacer.\`,
            variant: 'destructive',
            confirmText: 'Eliminar',
            onConfirm: () => {
                router.delete(route('{$routePrefix}.destroy', item.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    // 📝 TODO: Personaliza las columnas según tus necesidades
    const columns: Column<{$modelName}>[] = [
        {
            header: 'ID',
            accessor: 'id',
            className: 'w-20',
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
            render: (value) => (
                <div className="font-medium">{value}</div>
            ),
        },
        // 📝 TODO: Agrega más columnas aquí
    ];

    // 📝 TODO: Personaliza las acciones disponibles
    const actions: Action<{$modelName}>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('{$routePrefix}.show', row.id),
        },
        {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            href: (row) => route('{$routePrefix}.edit', row.id),
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'ghost',
            size: 'sm',
            onClick: handleDelete,
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        },
        // 📝 TODO: Agrega acciones personalizadas aquí
        // Ejemplo:
        // {
        //     label: 'Acción Custom',
        //     icon: <RefreshCw className="h-4 w-4" />,
        //     variant: 'outline',
        //     onClick: (row) => {
        //         router.post(route('{$routePrefix}.custom-action', row.id));
        //     },
        //     show: (row) => row.some_condition, // Opcional
        // },
    ];

    // 📝 TODO: Configura los filtros según tus necesidades
    const filterDefinitions: Filter[] = [
        // Ejemplo de filtro select:
        // {
        //     name: 'status',
        //     label: 'Estado',
        //     type: 'select',
        //     options: [
        //         { value: 'active', label: 'Activo' },
        //         { value: 'inactive', label: 'Inactivo' },
        //     ],
        //     placeholder: 'Todos',
        // },
        // Ejemplo de filtro de fecha:
        // {
        //     name: 'fecha_desde',
        //     label: 'Desde',
        //     type: 'date',
        // },
    ];

    return (
        <CrudLayout
            title="{$pluralName}"
            description="Administra los registros de {$variableName}"
            createRoute={route('{$routePrefix}.create')}
            createLabel="Nuevo {$modelName}"
        >
            <DataTableAdvanced
                data={{$variableName}.data}
                columns={columns}
                actions={actions}
                pagination={{$variableName}}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                searchPlaceholder="Buscar..."
                searchFields={['nombre']} // 📝 TODO: Ajusta los campos de búsqueda
                routeName="{$routePrefix}.index"
                emptyMessage="No se encontraron registros"
            />

            {dialog}
        </CrudLayout>
    );
}
TYPESCRIPT;

        $directory = resource_path("js/pages/{$name}");
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        file_put_contents("{$directory}/Index.tsx", $template);
    }
}
