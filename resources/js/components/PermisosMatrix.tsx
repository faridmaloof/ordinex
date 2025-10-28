import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  descripcion?: string;
}

interface PermisosMatrixProps {
  permisos: Permiso[];
  selectedPermisos: number[];
  onChange: (permisos: number[]) => void;
  disabled?: boolean;
}

// Agrupar permisos por módulo y tipo de acción
const agruparPermisos = (permisos: Permiso[]) => {
  const grupos: Record<string, Permiso[]> = {};
  
  permisos.forEach((permiso) => {
    if (!grupos[permiso.modulo]) {
      grupos[permiso.modulo] = [];
    }
    grupos[permiso.modulo].push(permiso);
  });
  
  return grupos;
};

// Obtener tipos de acciones únicas (viewAny, view, create, update, delete)
const obtenerAcciones = (permisos: Permiso[]) => {
  const acciones = new Set<string>();
  
  permisos.forEach((permiso) => {
    const partes = permiso.codigo.split('.');
    if (partes.length === 2) {
      acciones.add(partes[1]);
    }
  });
  
  return Array.from(acciones).sort((a, b) => {
    // Orden: viewAny, view, create, update, delete
    const orden = ['viewAny', 'view', 'create', 'update', 'delete'];
    return orden.indexOf(a) - orden.indexOf(b);
  });
};

// Etiquetas amigables para las acciones
const accionLabels: Record<string, string> = {
  viewAny: 'Ver Lista',
  view: 'Ver Detalle',
  create: 'Crear',
  update: 'Actualizar',
  delete: 'Eliminar',
};

export function PermisosMatrix({ 
  permisos, 
  selectedPermisos, 
  onChange, 
  disabled = false 
}: PermisosMatrixProps) {
  const [grupos, setGrupos] = useState<Record<string, Permiso[]>>({});
  const [acciones, setAcciones] = useState<string[]>([]);

  useEffect(() => {
    setGrupos(agruparPermisos(permisos));
    setAcciones(obtenerAcciones(permisos));
  }, [permisos]);

  const handleToggle = (permisoId: number) => {
    if (disabled) return;
    
    if (selectedPermisos.includes(permisoId)) {
      onChange(selectedPermisos.filter((id) => id !== permisoId));
    } else {
      onChange([...selectedPermisos, permisoId]);
    }
  };

  const handleToggleModulo = (modulo: string) => {
    if (disabled) return;
    
    const permisosDelModulo = grupos[modulo].map((p) => p.id);
    const todosSeleccionados = permisosDelModulo.every((id) => selectedPermisos.includes(id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos del módulo
      onChange(selectedPermisos.filter((id) => !permisosDelModulo.includes(id)));
    } else {
      // Seleccionar todos del módulo
      const nuevosPermisos = [...selectedPermisos];
      permisosDelModulo.forEach((id) => {
        if (!nuevosPermisos.includes(id)) {
          nuevosPermisos.push(id);
        }
      });
      onChange(nuevosPermisos);
    }
  };

  const handleToggleAccion = (accion: string) => {
    if (disabled) return;
    
    const permisosDeAccion = permisos
      .filter((p) => p.codigo.endsWith(`.${accion}`))
      .map((p) => p.id);
    
    const todosSeleccionados = permisosDeAccion.every((id) => selectedPermisos.includes(id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos de la acción
      onChange(selectedPermisos.filter((id) => !permisosDeAccion.includes(id)));
    } else {
      // Seleccionar todos de la acción
      const nuevosPermisos = [...selectedPermisos];
      permisosDeAccion.forEach((id) => {
        if (!nuevosPermisos.includes(id)) {
          nuevosPermisos.push(id);
        }
      });
      onChange(nuevosPermisos);
    }
  };

  const handleSeleccionarTodos = () => {
    if (disabled) return;
    
    if (selectedPermisos.length === permisos.length) {
      onChange([]);
    } else {
      onChange(permisos.map((p) => p.id));
    }
  };

  const todosMarcados = selectedPermisos.length === permisos.length;
  const algunosMarcados = selectedPermisos.length > 0 && selectedPermisos.length < permisos.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Permisos del Rol</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPermisos.length} de {permisos.length} seleccionados
            </span>
            <button
              type="button"
              onClick={handleSeleccionarTodos}
              disabled={disabled}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : todosMarcados
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {todosMarcados ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium sticky left-0 bg-white z-10">
                  Módulo
                </th>
                {acciones.map((accion) => (
                  <th key={accion} className="text-center p-2 font-medium min-w-[100px]">
                    <button
                      type="button"
                      onClick={() => handleToggleAccion(accion)}
                      disabled={disabled}
                      className={`text-sm hover:text-blue-600 transition-colors ${
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {accionLabels[accion] || accion}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grupos).map(([modulo, permisosModulo]) => {
                const permisosDelModuloIds = permisosModulo.map((p) => p.id);
                const todosSeleccionados = permisosDelModuloIds.every((id) =>
                  selectedPermisos.includes(id)
                );
                const algunosSeleccionados =
                  permisosDelModuloIds.some((id) => selectedPermisos.includes(id)) &&
                  !todosSeleccionados;

                return (
                  <tr key={modulo} className="border-b hover:bg-gray-50">
                    <td className="p-2 sticky left-0 bg-white z-10">
                      <button
                        type="button"
                        onClick={() => handleToggleModulo(modulo)}
                        disabled={disabled}
                        className={`flex items-center gap-2 font-medium hover:text-blue-600 transition-colors ${
                          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            todosSeleccionados
                              ? 'bg-blue-600 border-blue-600'
                              : algunosSeleccionados
                              ? 'bg-blue-300 border-blue-300'
                              : 'border-gray-300'
                          }`}
                        >
                          {todosSeleccionados && <Check className="w-3 h-3 text-white" />}
                          {algunosSeleccionados && (
                            <div className="w-2 h-0.5 bg-white rounded" />
                          )}
                        </div>
                        <span className="capitalize">{modulo}</span>
                      </button>
                    </td>
                    {acciones.map((accion) => {
                      const permiso = permisosModulo.find((p) =>
                        p.codigo.endsWith(`.${accion}`)
                      );

                      if (!permiso) {
                        return (
                          <td key={accion} className="text-center p-2">
                            <span className="text-gray-300">—</span>
                          </td>
                        );
                      }

                      const isSelected = selectedPermisos.includes(permiso.id);

                      return (
                        <td key={accion} className="text-center p-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(permiso.id)}
                            disabled={disabled}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                              disabled
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:scale-110'
                            } ${
                              isSelected
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                            title={permiso.nombre}
                          >
                            {isSelected ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>Permiso Otorgado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
              <X className="w-3 h-3 text-gray-400" />
            </div>
            <span>Permiso Denegado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">—</span>
            <span>No Disponible</span>
          </div>
        </div>

        {/* Resumen por módulo */}
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(grupos).map(([modulo, permisosModulo]) => {
            const seleccionados = permisosModulo.filter((p) =>
              selectedPermisos.includes(p.id)
            ).length;
            const total = permisosModulo.length;
            const porcentaje = Math.round((seleccionados / total) * 100);

            return (
              <Badge key={modulo} variant="outline" className="flex items-center gap-2">
                <span className="capitalize">{modulo}</span>
                <span
                  className={`text-xs ${
                    porcentaje === 100
                      ? 'text-green-600'
                      : porcentaje > 0
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {seleccionados}/{total}
                </span>
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
