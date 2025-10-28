import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import CrudLayout from '@/layouts/CrudLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/form-field';
import { TextareaField } from '@/components/textarea-field';
import { SelectField } from '@/components/select-field';
import { PermisosMatrix } from '@/components/PermisosMatrix';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  descripcion?: string;
}

interface Props {
  permisos: Permiso[];
}

interface FormData {
  nombre: string;
  nivel: string;
  descripcion: string;
  color: string;
  activo: boolean;
  permisos: number[];
}

// Colores predefinidos para roles
const coloresDisponibles = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
  { value: '#14B8A6', label: 'Teal' },
];

const RolesCreate: React.FC<Props> = ({ permisos: permisosIniciales }) => {
  const [permisos, setPermisos] = useState<Permiso[]>(permisosIniciales || []);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    nombre: '',
    nivel: '1',
    descripcion: '',
    color: '#3B82F6',
    activo: true,
    permisos: [],
  });

  // Cargar permisos si no vienen en props
  useEffect(() => {
    if (!permisosIniciales || permisosIniciales.length === 0) {
      axios.get('/api/permisos').then((response) => {
        setPermisos(response.data);
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('config.roles.store'), {
      preserveScroll: true,
    });
  };

  const handleCancel = () => {
    router.visit(route('config.roles.index'));
  };

  return (
    <>
      <Head title="Crear Rol" />
      <CrudLayout
        title="Crear Rol"
        description="Define un nuevo rol con sus permisos"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="nombre"
                  label="Nombre del Rol"
                  required
                  error={errors.nombre}
                  value={data.nombre}
                  onChange={(e) => setData('nombre', e.target.value)}
                  placeholder="Ej: Administrador, Operador, Supervisor"
                />

                <SelectField
                  name="nivel"
                  label="Nivel de Jerarquía"
                  required
                  error={errors.nivel}
                  value={data.nivel}
                  onChange={(value) => setData('nivel', value)}
                  options={[
                    { value: '1', label: 'Nivel 1 - Más Alto' },
                    { value: '2', label: 'Nivel 2' },
                    { value: '3', label: 'Nivel 3' },
                    { value: '4', label: 'Nivel 4' },
                    { value: '5', label: 'Nivel 5' },
                    { value: '6', label: 'Nivel 6 - Más Bajo' },
                  ]}
                  helpText="Define la jerarquía del rol (1 = Mayor autoridad)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="color"
                  label="Color Identificador"
                  required
                  error={errors.color}
                  value={data.color}
                  onChange={(value) => setData('color', value)}
                  options={coloresDisponibles}
                  renderOption={(option) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.value }}
                      />
                      <span>{option.label}</span>
                    </div>
                  )}
                  helpText="Color para visualizar el rol en la interfaz"
                />

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.activo}
                      onChange={(e) => setData('activo', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Rol Activo</span>
                  </label>
                </div>
              </div>

              <TextareaField
                name="descripcion"
                label="Descripción"
                error={errors.descripcion}
                value={data.descripcion}
                onChange={(e) => setData('descripcion', e.target.value)}
                placeholder="Describe las responsabilidades de este rol..."
                rows={3}
                helpText="Opcional: Descripción del rol y sus responsabilidades"
              />
            </CardContent>
          </Card>

          {/* Matriz de Permisos */}
          <PermisosMatrix
            permisos={permisos}
            selectedPermisos={data.permisos}
            onChange={(permisos) => setData('permisos', permisos)}
          />

          {errors.permisos && (
            <p className="text-sm text-destructive">{errors.permisos}</p>
          )}

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
              {processing ? 'Guardando...' : 'Crear Rol'}
            </Button>
          </div>
        </form>
      </CrudLayout>
    </>
  );
};

export default RolesCreate;
