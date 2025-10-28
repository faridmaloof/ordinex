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
  Mail, 
  Phone, 
  CreditCard,
  Wallet,
  Clock,
  Key
} from 'lucide-react';

interface Rol {
  id: number;
  nombre: string;
  nivel: number;
  color?: string;
  permisos?: Array<{ codigo: string; nombre: string }>;
}

interface Usuario {
  id: number;
  name: string;
  email: string;
  documento?: string;
  telefono?: string;
  activo: boolean;
  es_super_admin: boolean;
  rol?: Rol;
  caja_defecto?: {
    id: number;
    nombre: string;
  };
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  usuario: Usuario;
  permisos_count?: number;
}

const UsuariosShow: React.FC<Props> = ({ usuario, permisos_count = 0 }) => {
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = () => {
    confirm({
      title: '¿Eliminar Usuario?',
      description: `¿Estás seguro de que deseas eliminar al usuario "${usuario.name}"? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      confirmText: 'Eliminar',
      onConfirm: () => {
        router.delete(route('config.usuarios.destroy', usuario.id), {
          onSuccess: () => {
            router.visit(route('config.usuarios.index'));
          },
        });
      },
    });
  };

  const handleEdit = () => {
    router.visit(route('config.usuarios.edit', usuario.id));
  };

  const handleBack = () => {
    router.visit(route('config.usuarios.index'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUltimoAccesoColor = () => {
    if (!usuario.ultimo_acceso) return 'text-muted-foreground';
    
    const fecha = new Date(usuario.ultimo_acceso);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'text-green-600';
    if (dias <= 7) return 'text-blue-600';
    if (dias <= 30) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <>
      <Head title={`Usuario: ${usuario.name}`} />
      <CrudLayout
        title={usuario.name}
        description={usuario.email}
      >
        {/* Header con acciones */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge 
              variant="default" 
              className={usuario.activo ? 'bg-green-600' : 'bg-gray-400'}
            >
              {usuario.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            
            {usuario.es_super_admin && (
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-amber-600" />
                <Badge variant="default" className="bg-amber-600">
                  Super Administrador
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>

            <Can permission="usuarios.update">
              <Button variant="default" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Can>

            <Can permission="usuarios.delete">
              {!usuario.es_super_admin && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </Can>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nombre Completo
                  </label>
                  <p className="text-base font-medium mt-1">{usuario.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Correo Electrónico
                    </label>
                    <p className="text-base mt-1">{usuario.email}</p>
                  </div>
                </div>

                {usuario.documento && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Documento
                      </label>
                      <p className="text-base mt-1">{usuario.documento}</p>
                    </div>
                  </div>
                )}

                {usuario.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Teléfono
                      </label>
                      <p className="text-base mt-1">{usuario.telefono}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Rol
                    </label>
                    <div className="mt-1">
                      {usuario.es_super_admin ? (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-amber-600" />
                          <Badge variant="default" className="bg-amber-600">
                            Super Administrador
                          </Badge>
                        </div>
                      ) : usuario.rol ? (
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: usuario.rol.color || '#6B7280',
                            color: usuario.rol.color || '#6B7280'
                          }}
                        >
                          {usuario.rol.nombre}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin rol asignado</span>
                      )}
                    </div>
                  </div>
                </div>

                {usuario.caja_defecto && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Caja Asignada
                      </label>
                      <p className="text-base mt-1">{usuario.caja_defecto.nombre}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${getUltimoAccesoColor()}`} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Último Acceso
                    </label>
                    <p className={`text-base mt-1 ${getUltimoAccesoColor()}`}>
                      {formatDateTime(usuario.ultimo_acceso)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permisos (solo si tiene rol) */}
          {usuario.rol && !usuario.es_super_admin && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Permisos Heredados del Rol</CardTitle>
              </CardHeader>
              <CardContent>
                {usuario.rol.permisos && usuario.rol.permisos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {usuario.rol.permisos.map((permiso) => (
                      <Badge key={permiso.codigo} variant="outline" className="justify-start">
                        {permiso.nombre}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Total de permisos: <span className="font-semibold">{permisos_count}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fechas de Registro */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información de Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Creación
                  </label>
                  <p className="text-base mt-1">{formatDate(usuario.created_at)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Última Actualización
                  </label>
                  <p className="text-base mt-1">{formatDate(usuario.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notas adicionales */}
        {usuario.es_super_admin && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Usuario Super Administrador
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Este usuario tiene acceso completo a todas las funcionalidades del sistema sin 
                  restricciones. No se pueden eliminar usuarios super administradores.
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

export default UsuariosShow;
