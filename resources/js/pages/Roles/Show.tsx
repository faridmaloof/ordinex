import React from 'react';
import { Head, router } from '@inertiajs/react';
import CrudLayout from '@/layouts/CrudLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/hooks/usePermissions';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Shield, 
  Users,
  Check,
  X
} from 'lucide-react';

interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  descripcion?: string;
}

interface Usuario {
  id: number;
  name: string;
  email: string;
}

interface Rol {
  id: number;
  nombre: string;
  nivel: number;
  descripcion?: string;
  color: string;
  activo: boolean;
  permisos: Permiso[];
  usuarios: Usuario[];
  created_at: string;
  updated_at: string;
}

interface Props {
  rol: Rol;
}

const RolesShow: React.FC<Props> = ({ rol }) => {
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = () => {
    confirm({
      title: '¿Eliminar Rol?',
      description: `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('config.roles.destroy', rol.id), {
          onSuccess: () => {
            router.visit(route('config.roles.index'));
          },
        });
      },
    });
  };

  const handleEdit = () => {
    router.visit(route('config.roles.edit', rol.id));
  };

  const handleBack = () => {
    router.visit(route('config.roles.index'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Agrupar permisos por módulo
  const permisosPorModulo = rol.permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>);

  return (
    <>
      <Head title={`Rol: ${rol.nombre}`} />
      <CrudLayout
        title={rol.nombre}
        description={rol.descripcion || 'Rol del sistema'}
      >
        {/* Header con acciones */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: rol.color }}
            />
            <Badge variant="outline" className="font-mono">
              Nivel {rol.nivel}
            </Badge>
            <Badge 
              variant="default" 
              className={rol.activo ? 'bg-green-600' : 'bg-gray-400'}
            >
              {rol.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>

            <Can permission="roles.update">
              <Button variant="default" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Can>

            <Can permission="roles.delete">
              {rol.usuarios.length === 0 && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </Can>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nombre del Rol
                  </label>
                  <p className="text-base font-medium mt-1">{rol.nombre}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nivel de Jerarquía
                  </label>
                  <p className="text-base mt-1">
                    Nivel {rol.nivel} 
                    <span className="text-sm text-muted-foreground ml-2">
                      ({rol.nivel === 1 ? 'Mayor autoridad' : rol.nivel === 6 ? 'Menor autoridad' : 'Autoridad media'})
                    </span>
                  </p>
                </div>
              </div>

              {rol.descripcion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </label>
                  <p className="text-base mt-1">{rol.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Creación
                  </label>
                  <p className="text-base mt-1">{formatDate(rol.created_at)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Última Actualización
                  </label>
                  <p className="text-base mt-1">{formatDate(rol.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permisos por Módulo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permisos Asignados</CardTitle>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>{rol.permisos.length} permisos</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(permisosPorModulo).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                    <div key={modulo} className="border rounded-lg p-4">
                      <h4 className="font-semibold capitalize mb-3 flex items-center gap-2">
                        {modulo}
                        <Badge variant="outline" className="text-xs">
                          {permisos.length}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {permisos.map((permiso) => (
                          <div
                            key={permiso.id}
                            className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md"
                          >
                            <Check className="h-4 w-4" />
                            <span>{permiso.nombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <X className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Este rol no tiene permisos asignados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuarios Asignados */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuarios con este Rol</CardTitle>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>{rol.usuarios.length} usuarios</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {rol.usuarios.length > 0 ? (
                <div className="space-y-2">
                  {rol.usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{usuario.name}</p>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      </div>
                      <Can permission="usuarios.view">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.visit(route('config.usuarios.show', usuario.id))}
                        >
                          Ver Usuario
                        </Button>
                      </Can>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios asignados a este rol</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advertencia si tiene usuarios */}
        {rol.usuarios.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Rol en uso
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Este rol tiene {rol.usuarios.length} usuario(s) asignado(s). 
                  No se puede eliminar mientras tenga usuarios asociados.
                </p>
              </div>
            </div>
          </div>
        )}
      </CrudLayout>
      
      {dialog}
    </>
  );
};

export default RolesShow;
