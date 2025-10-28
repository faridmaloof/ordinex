import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import CrudLayout from '@/layouts/CrudLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/form-field';
import { SelectField } from '@/components/select-field';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import axios from 'axios';

interface Rol {
  id: number;
  nombre: string;
  nivel: number;
  color?: string;
}

interface Caja {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Usuario {
  id: number;
  name: string;
  email: string;
  documento?: string;
  telefono?: string;
  activo: boolean;
  es_super_admin: boolean;
  rol_id?: number;
  caja_defecto_id?: number;
  rol?: Rol;
}

interface Props {
  usuario: Usuario;
  roles: Rol[];
  cajas: Caja[];
}

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  documento: string;
  telefono: string;
  rol_id: string;
  caja_defecto_id: string;
  activo: boolean;
  es_super_admin: boolean;
}

const UsuariosEdit: React.FC<Props> = ({ usuario, roles, cajas }) => {
  const { isSuperAdmin } = usePermissions();
  const [rolesList, setRolesList] = useState<Rol[]>(roles);
  const [cajasList, setCajasList] = useState<Caja[]>(cajas);
  const [changePassword, setChangePassword] = useState(false);

  const { data, setData, put, processing, errors } = useForm<FormData>({
    name: usuario.name || '',
    email: usuario.email || '',
    password: '',
    password_confirmation: '',
    documento: usuario.documento || '',
    telefono: usuario.telefono || '',
    rol_id: usuario.rol_id?.toString() || '',
    caja_defecto_id: usuario.caja_defecto_id?.toString() || '',
    activo: usuario.activo,
    es_super_admin: usuario.es_super_admin,
  });

  // Cargar roles y cajas si no vienen en props
  useEffect(() => {
    if (!roles || roles.length === 0) {
      axios.get('/api/roles').then((response) => {
        setRolesList(response.data);
      });
    }
    
    if (!cajas || cajas.length === 0) {
      axios.get('/api/cajas').then((response) => {
        setCajasList(response.data);
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si no se quiere cambiar la contraseña, no enviarla
    const formData = { ...data };
    if (!changePassword) {
      formData.password = '';
      formData.password_confirmation = '';
    }
    
    put(route('config.usuarios.update', usuario.id), formData, {
      preserveScroll: true,
    });
  };

  const handleCancel = () => {
    router.visit(route('config.usuarios.index'));
  };

  // Validar jerarquía - no puede editar usuarios de nivel superior
  const canEditRole = isSuperAdmin() || !usuario.rol || !usuario.rol.nivel;

  return (
    <>
      <Head title={`Editar Usuario: ${usuario.name}`} />
      <CrudLayout
        title="Editar Usuario"
        description={`Modificar información de ${usuario.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="name"
                  label="Nombre Completo"
                  required
                  error={errors.name}
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />

                <FormField
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  required
                  error={errors.email}
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="documento"
                  label="Documento de Identidad"
                  error={errors.documento}
                  value={data.documento}
                  onChange={(e) => setData('documento', e.target.value)}
                  placeholder="Ej: 1234567"
                />

                <FormField
                  name="telefono"
                  label="Teléfono"
                  error={errors.telefono}
                  value={data.telefono}
                  onChange={(e) => setData('telefono', e.target.value)}
                  placeholder="Ej: +591 12345678"
                />
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Cambiar Contraseña</span>
              </label>

              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                  <FormField
                    name="password"
                    label="Nueva Contraseña"
                    type="password"
                    required={changePassword}
                    error={errors.password}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    helpText="Dejar vacío para mantener la contraseña actual"
                  />

                  <FormField
                    name="password_confirmation"
                    label="Confirmar Contraseña"
                    type="password"
                    required={changePassword}
                    error={errors.password_confirmation}
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="rol_id"
                  label="Rol"
                  required
                  error={errors.rol_id}
                  value={data.rol_id}
                  onChange={(value) => setData('rol_id', value)}
                  options={rolesList.map((rol) => ({
                    value: rol.id.toString(),
                    label: rol.nombre,
                  }))}
                  placeholder="Selecciona un rol"
                  helpText={
                    canEditRole
                      ? 'Define los permisos del usuario'
                      : '⚠️ No puedes modificar el rol de este usuario'
                  }
                  disabled={!canEditRole}
                />

                <SelectField
                  name="caja_defecto_id"
                  label="Caja Asignada"
                  error={errors.caja_defecto_id}
                  value={data.caja_defecto_id}
                  onChange={(value) => setData('caja_defecto_id', value)}
                  options={[
                    { value: '', label: 'Sin caja asignada' },
                    ...cajasList
                      .filter((caja) => caja.activo)
                      .map((caja) => ({
                        value: caja.id.toString(),
                        label: caja.nombre,
                      })),
                  ]}
                  placeholder="Selecciona una caja"
                  helpText="Caja por defecto para operaciones"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.activo}
                    onChange={(e) => setData('activo', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Usuario Activo</span>
                </label>

                {isSuperAdmin() && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.es_super_admin}
                      onChange={(e) => setData('es_super_admin', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">Super Administrador</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Acceso total al sistema)
                    </span>
                  </label>
                )}
                {errors.es_super_admin && (
                  <p className="text-sm text-destructive">{errors.es_super_admin}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={processing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              {processing ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CrudLayout>
    </>
  );
};

export default UsuariosEdit;
