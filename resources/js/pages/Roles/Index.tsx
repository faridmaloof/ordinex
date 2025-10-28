import React from 'react';import CrudLayout from '@/layouts/CrudLayout';

import { Head, router } from '@inertiajs/react';import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';

import CrudLayout from '@/layouts/CrudLayout';import { router } from '@inertiajs/react';

import DataTableAdvanced from '@/components/DataTable/DataTableAdvanced';import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';import { useConfirmDialog } from '@/components/confirm-dialog';

import { Action, PaginatedData, DataFilter } from '@/types';import { EstadoBadge } from '@/components/estado-badge';

import { useConfirmDialog } from '@/components/confirm-dialog';

import { Eye, Pencil, Trash2, Shield, Users } from 'lucide-react';// 📝 TODO: Ajusta esta interfaz según tu modelo

interface Role {

interface Rol {    id: number;

  id: number;    nombre: string;

  nombre: string;    // Agrega más campos según tu modelo

  nivel: number;}

  descripcion?: string;

  color?: string;interface Props {

  activo: boolean;    roles: {

  usuarios_count: number;        data: Role[];

  permisos_count: number;        current_page: number;

}        from: number;

        last_page: number;

interface Props {        links: Array<{ url: string | null; label: string; active: boolean }>;

  roles: PaginatedData<Rol>;        path: string;

  filters: {        per_page: number;

    search?: string;        to: number;

    activo?: string;        total: number;

  };    };

}    filters: Record<string, any>;

}

const RolesIndex: React.FC<Props> = ({ roles, filters }) => {

  const { confirm, dialog } = useConfirmDialog();export default function Index({ roles, filters = {} }: Props) {

    const { confirm, dialog } = useConfirmDialog();

  const handleDelete = (rol: Rol) => {

    confirm({    const handleDelete = (item: Role) => {

      title: '¿Eliminar Rol?',        confirm({

      description: `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,            title: '¿Eliminar registro?',

      variant: 'destructive',            description: \`¿Está seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.\`,

      confirmText: 'Eliminar',            variant: 'destructive',

      onConfirm: () => {            confirmText: 'Eliminar',

        router.delete(route('config.roles.destroy', rol.id), {            onConfirm: () => {

          preserveScroll: true,                router.delete(route('config.roles.destroy', item.id), {

        });                    preserveScroll: true,

      },                });

    });            },

  };        });

    };

  const columns = [

    {    // 📝 TODO: Personaliza las columnas según tus necesidades

      key: 'nombre',    const columns: Column<Role>[] = [

      label: 'Nombre del Rol',        {

      sortable: true,            header: 'ID',

      render: (rol: Rol) => (            accessor: 'id',

        <div className="flex items-center gap-2">            className: 'w-20',

          <div        },

            className="w-3 h-3 rounded-full"        {

            style={{ backgroundColor: rol.color || '#6B7280' }}            header: 'Nombre',

          />            accessor: 'nombre',

          <div className="flex flex-col">            render: (value) => (

            <div className="font-medium">{rol.nombre}</div>                <div className="font-medium">{value}</div>

            {rol.descripcion && (            ),

              <div className="text-sm text-muted-foreground">{rol.descripcion}</div>        },

            )}        // 📝 TODO: Agrega más columnas aquí

          </div>    ];

        </div>

      ),    // 📝 TODO: Personaliza las acciones disponibles

    },    const actions: Action<Role>[] = [

    {        {

      key: 'nivel',            label: 'Ver',

      label: 'Nivel',            icon: <Eye className="h-4 w-4" />,

      sortable: true,            variant: 'ghost',

      render: (rol: Rol) => (            size: 'sm',

        <Badge variant="outline" className="font-mono">            href: (row) => route('config.roles.show', row.id),

          Nivel {rol.nivel}        },

        </Badge>        {

      ),            label: 'Editar',

    },            icon: <Pencil className="h-4 w-4" />,

    {            variant: 'ghost',

      key: 'permisos_count',            size: 'sm',

      label: 'Permisos',            href: (row) => route('config.roles.edit', row.id),

      sortable: true,        },

      render: (rol: Rol) => (        {

        <div className="flex items-center gap-2">            label: 'Eliminar',

          <Shield className="h-4 w-4 text-blue-600" />            icon: <Trash2 className="h-4 w-4" />,

          <span className="font-medium">{rol.permisos_count}</span>            variant: 'ghost',

          <span className="text-sm text-muted-foreground">permisos</span>            size: 'sm',

        </div>            onClick: handleDelete,

      ),            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',

    },        },

    {        // 📝 TODO: Agrega acciones personalizadas aquí

      key: 'usuarios_count',        // Ejemplo:

      label: 'Usuarios Asignados',        // {

      sortable: true,        //     label: 'Acción Custom',

      render: (rol: Rol) => (        //     icon: <RefreshCw className="h-4 w-4" />,

        <div className="flex items-center gap-2">        //     variant: 'outline',

          <Users className="h-4 w-4 text-purple-600" />        //     onClick: (row) => {

          <span className="font-medium">{rol.usuarios_count}</span>        //         router.post(route('config.roles.custom-action', row.id));

          <span className="text-sm text-muted-foreground">usuarios</span>        //     },

        </div>        //     show: (row) => row.some_condition, // Opcional

      ),        // },

    },    ];

    {

      key: 'activo',    // 📝 TODO: Configura los filtros según tus necesidades

      label: 'Estado',    const filterDefinitions: Filter[] = [

      sortable: true,        // Ejemplo de filtro select:

      render: (rol: Rol) => (        // {

        <Badge         //     name: 'status',

          variant="default"         //     label: 'Estado',

          className={rol.activo ? 'bg-green-600' : 'bg-gray-400'}        //     type: 'select',

        >        //     options: [

          {rol.activo ? 'Activo' : 'Inactivo'}        //         { value: 'active', label: 'Activo' },

        </Badge>        //         { value: 'inactive', label: 'Inactivo' },

      ),        //     ],

    },        //     placeholder: 'Todos',

  ];        // },

        // Ejemplo de filtro de fecha:

  const actions: Action<Rol>[] = [        // {

    {        //     name: 'fecha_desde',

      label: 'Ver',        //     label: 'Desde',

      icon: <Eye className="h-4 w-4" />,        //     type: 'date',

      onClick: (rol) => router.visit(route('config.roles.show', rol.id)),        // },

      permission: 'roles.view',    ];

    },

    {    return (

      label: 'Editar',        <CrudLayout

      icon: <Pencil className="h-4 w-4" />,            title="Roles"

      onClick: (rol) => router.visit(route('config.roles.edit', rol.id)),            description="Administra los registros de roles"

      permission: 'roles.update',            createRoute={route('config.roles.create')}

    },            createLabel="Nuevo Role"

    {        >

      label: 'Eliminar',            <DataTableAdvanced

      icon: <Trash2 className="h-4 w-4" />,                data={roles.data}

      onClick: handleDelete,                columns={columns}

      variant: 'destructive',                actions={actions}

      permission: 'roles.delete',                pagination={roles}

      show: (rol) => rol.usuarios_count === 0, // No eliminar si tiene usuarios                filters={filterDefinitions}

    },                currentFilters={filters}

  ];                searchable

                searchPlaceholder="Buscar..."

  const tableFilters: DataFilter[] = [                searchFields={['nombre']} // 📝 TODO: Ajusta los campos de búsqueda

    {                routeName="config.roles.index"

      key: 'activo',                emptyMessage="No se encontraron registros"

      label: 'Estado',            />

      type: 'select',

      options: [            {dialog}

        { value: '1', label: 'Activos' },        </CrudLayout>

        { value: '0', label: 'Inactivos' },    );

      ],}
      value: filters.activo,
    },
  ];

  return (
    <>
      <Head title="Roles y Permisos" />
      <CrudLayout
        title="Roles y Permisos"
        description="Gestión de roles y sus permisos del sistema"
        createRoute={route('config.roles.create')}
        createLabel="Nuevo Rol"
        createPermission="roles.create"
      >
        <DataTableAdvanced
          columns={columns}
          data={roles.data}
          actions={actions}
          pagination={{
            currentPage: roles.current_page,
            lastPage: roles.last_page,
            perPage: roles.per_page,
            total: roles.total,
            from: roles.from || 0,
            to: roles.to || 0,
          }}
          filters={tableFilters}
          searchPlaceholder="Buscar por nombre o descripción..."
          routeName="config.roles.index"
        />
      </CrudLayout>
      
      {dialog}
    </>
  );
};

export default RolesIndex;
