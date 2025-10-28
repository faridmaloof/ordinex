# 📋 Plantillas de Código - Sistema Ordinex

Este archivo contiene plantillas reutilizables para agilizar el desarrollo.

---

## 🎯 MODELOS ELOQUENT

### Plantilla Base para Modelos

```php
<?php

namespace App\Models\[Modulo]; // Config, Catalogo, Documento, Transaccion, Auditoria

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class [NombreModelo] extends Model
{
    // Nombre de la tabla
    protected $table = '[prefijo]__[nombre_tabla]';

    // Campos asignables en masa
    protected $fillable = [
        // Listar todos los campos excepto id, timestamps
    ];

    // Casteo de tipos
    protected $casts = [
        'activo' => 'boolean',
        'campo_decimal' => 'decimal:2',
        'campo_fecha' => 'date',
        'campo_datetime' => 'datetime',
        'campo_json' => 'array',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Relación: Pertenece a (foreignKey en esta tabla)
     */
    public function relacion(): BelongsTo
    {
        return $this->belongsTo(OtroModelo::class, 'foreign_key_id');
    }

    /**
     * Relación: Tiene muchos (foreignKey en otra tabla)
     */
    public function items(): HasMany
    {
        return $this->hasMany(ItemModelo::class, 'parent_id');
    }

    /**
     * Relación: Muchos a muchos (tabla pivote)
     */
    public function relacionados(): BelongsToMany
    {
        return $this->belongsToMany(
            OtroModelo::class,
            'tabla_pivote',
            'este_modelo_id',
            'otro_modelo_id'
        )->withTimestamps();
    }

    // ============================================
    // SCOPES (Consultas reutilizables)
    // ============================================

    /**
     * Scope: Activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: Por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    /**
     * Scope: Por estado
     */
    public function scopeEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    // ============================================
    // ACCESSORS (Modificar al leer)
    // ============================================

    /**
     * Accessor: Formatear campo
     */
    protected function nombreCompleto(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->nombre} {$this->apellido}",
        );
    }

    // ============================================
    // MUTATORS (Modificar al escribir)
    // ============================================

    /**
     * Mutator: Convertir a mayúsculas
     */
    protected function codigo(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => strtoupper($value),
        );
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Verificar estado
     */
    public function estaActivo(): bool
    {
        return $this->activo === true;
    }

    /**
     * Calcular total
     */
    public function calcularTotal(): float
    {
        return $this->items->sum('total');
    }
}
```

---

## 🎮 CONTROLLERS CON INERTIA

### Plantilla Base para Controllers

```php
<?php

namespace App\Http\Controllers\[Modulo];

use App\Http\Controllers\Controller;
use App\Models\[Modulo]\[Modelo];
use App\Http\Requests\[Modelo]StoreRequest;
use App\Http\Requests\[Modelo]UpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class [Modelo]Controller extends Controller
{
    /**
     * Listar registros
     */
    public function index(Request $request): Response
    {
        $query = [Modelo]::query()
            ->with(['relacion1', 'relacion2'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', "%{$request->buscar}%");
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $registros = $query->paginate(15)->withQueryString();

        return Inertia::render('[Modulo]/[Modelo]/Index', [
            'registros' => $registros,
            'filtros' => $request->only(['buscar', 'estado']),
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create(): Response
    {
        return Inertia::render('[Modulo]/[Modelo]/Create', [
            // Datos necesarios para el formulario
            'opciones' => ModeloRelacionado::activo()->get(),
        ]);
    }

    /**
     * Guardar nuevo registro
     */
    public function store([Modelo]StoreRequest $request)
    {
        try {
            $registro = [Modelo]::create($request->validated());

            return redirect()
                ->route('[modulo].[modelo].index')
                ->with('success', '[Modelo] creado exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Error al crear: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Mostrar detalle
     */
    public function show([Modelo] $registro): Response
    {
        $registro->load(['relacion1', 'relacion2']);

        return Inertia::render('[Modulo]/[Modelo]/Show', [
            'registro' => $registro,
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit([Modelo] $registro): Response
    {
        return Inertia::render('[Modulo]/[Modelo]/Edit', [
            'registro' => $registro,
            'opciones' => ModeloRelacionado::activo()->get(),
        ]);
    }

    /**
     * Actualizar registro
     */
    public function update([Modelo]UpdateRequest $request, [Modelo] $registro)
    {
        try {
            $registro->update($request->validated());

            return redirect()
                ->route('[modulo].[modelo].show', $registro)
                ->with('success', '[Modelo] actualizado exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Eliminar registro
     */
    public function destroy([Modelo] $registro)
    {
        try {
            $registro->delete();

            return redirect()
                ->route('[modulo].[modelo].index')
                ->with('success', '[Modelo] eliminado exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
        }
    }
}
```

---

## ✅ FORMREQUESTS (Validaciones)

### Plantilla Base para FormRequests

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class [Modelo]StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Verificar permisos
        return $this->user()->tienePermiso('[modulo].crear');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'campo_requerido' => 'required|string|max:255',
            'email' => 'required|email|unique:tabla,email',
            'numero' => 'required|integer|min:0',
            'decimal' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'booleano' => 'required|boolean',
            'relacion_id' => 'required|exists:otra_tabla,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:items,id',
            'items.*.cantidad' => 'required|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'campo_requerido.required' => 'El campo es obligatorio',
            'email.unique' => 'Este email ya está registrado',
            'items.min' => 'Debe agregar al menos un item',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'campo_requerido' => 'nombre del campo',
            'relacion_id' => 'relacionado',
        ];
    }
}
```

---

## 🔧 SERVICES (Lógica de Negocio)

### Plantilla Base para Services

```php
<?php

namespace App\Services;

use App\Models\[Modelo];
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class [Modelo]Service
{
    /**
     * Crear nuevo registro con lógica compleja
     */
    public function crear(array $datos): [Modelo]
    {
        return DB::transaction(function () use ($datos) {
            // 1. Validaciones de negocio
            $this->validarReglas($datos);

            // 2. Crear registro principal
            $registro = [Modelo]::create([
                'campo1' => $datos['campo1'],
                'campo2' => $datos['campo2'],
            ]);

            // 3. Crear registros relacionados
            if (isset($datos['items'])) {
                $this->crearItems($registro, $datos['items']);
            }

            // 4. Calcular totales
            $this->calcularTotales($registro);

            // 5. Auditoría
            $this->registrarAuditoria('crear', $registro);

            return $registro->fresh();
        });
    }

    /**
     * Autorizar registro
     */
    public function autorizar([Modelo] $registro, int $usuarioId): bool
    {
        return DB::transaction(function () use ($registro, $usuarioId) {
            // Validar que puede ser autorizado
            if (!$this->puedeSerAutorizado($registro)) {
                throw new \Exception('No puede ser autorizado en su estado actual');
            }

            // Actualizar estado
            $registro->update([
                'estado' => 'autorizado',
                'usuario_autoriza_id' => $usuarioId,
                'fecha_autorizacion' => now(),
                'bloqueada_en' => now(),
            ]);

            // Generar documentos subsecuentes
            $this->generarDocumentosSiguientes($registro);

            return true;
        });
    }

    /**
     * Validaciones de reglas de negocio
     */
    protected function validarReglas(array $datos): void
    {
        // Ejemplo: Validar stock
        if (!$this->hayStockDisponible($datos['item_id'], $datos['cantidad'])) {
            throw new \Exception('Stock insuficiente');
        }

        // Ejemplo: Validar permisos especiales
        if ($datos['requiere_autorizacion'] && !auth()->user()->tienePermiso('autorizar')) {
            throw new \Exception('No tiene permisos para requerir autorización');
        }
    }

    /**
     * Calcular totales
     */
    protected function calcularTotales([Modelo] $registro): void
    {
        $subtotal = $registro->items->sum(function ($item) {
            return $item->cantidad * $item->precio_unitario;
        });

        $descuento = $subtotal * ($registro->porcentaje_descuento / 100);
        $iva = ($subtotal - $descuento) * 0.19;
        $total = $subtotal - $descuento + $iva;

        $registro->update([
            'subtotal' => $subtotal,
            'descuento' => $descuento,
            'iva' => $iva,
            'total' => $total,
        ]);
    }

    /**
     * Registrar auditoría
     */
    protected function registrarAuditoria(string $accion, [Modelo] $registro): void
    {
        Auditoria::create([
            'usuario_id' => auth()->id(),
            'accion' => $accion,
            'modulo' => '[modulo]',
            'tabla' => $registro->getTable(),
            'registro_id' => $registro->id,
            'datos_nuevos' => $registro->toArray(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
```

---

## 🌐 COMPONENTES REACT

### DataTable Component

```tsx
// resources/js/Components/DataTable.tsx
import React from 'react';
import { Link } from '@inertiajs/react';

interface Column {
    header: string;
    accessor: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    pagination?: any;
}

export default function DataTable({ columns, data, pagination }: DataTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                                    {column.render 
                                        ? column.render(row[column.accessor], row)
                                        : row[column.accessor]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {pagination && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                    <div className="flex-1 flex justify-between sm:hidden">
                        {pagination.prev_page_url && (
                            <Link
                                href={pagination.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                                Anterior
                            </Link>
                        )}
                        {pagination.next_page_url && (
                            <Link
                                href={pagination.next_page_url}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                                Siguiente
                            </Link>
                        )}
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{pagination.from}</span> a{' '}
                                <span className="font-medium">{pagination.to}</span> de{' '}
                                <span className="font-medium">{pagination.total}</span> resultados
                            </p>
                        </div>
                        {/* Agregar botones de paginación numérica */}
                    </div>
                </div>
            )}
        </div>
    );
}
```

### Modal Component

```tsx
// resources/js/Components/Modal.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({ show, onClose, title, children, maxWidth = 'md' }: ModalProps) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    };

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full ${maxWidthClass[maxWidth]} transform overflow-hidden rounded-lg bg-white shadow-xl transition-all`}
                            >
                                {title && (
                                    <div className="flex items-center justify-between px-6 py-4 border-b">
                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                )}
                                <div className="px-6 py-4">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
```

---

## 🎨 PÁGINAS INERTIA

### Index Page Template

```tsx
// resources/js/Pages/[Modulo]/[Modelo]/Index.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/DataTable';
import Button from '@/Components/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Props {
    registros: {
        data: any[];
        links: any;
        meta: any;
    };
    filtros: {
        buscar?: string;
        estado?: string;
    };
}

export default function Index({ registros, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar || '');

    const handleBuscar = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('[modulo].[modelo].index'), { buscar }, { preserveState: true });
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: 'nombre' },
        { 
            header: 'Estado', 
            accessor: 'estado',
            render: (value: string) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    value === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {value}
                </span>
            )
        },
        {
            header: 'Acciones',
            accessor: 'id',
            render: (id: number) => (
                <div className="flex space-x-2">
                    <Link
                        href={route('[modulo].[modelo].show', id)}
                        className="text-blue-600 hover:text-blue-900"
                    >
                        Ver
                    </Link>
                    <Link
                        href={route('[modulo].[modelo].edit', id)}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        Editar
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="[Modelo]s" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">[Modelo]s</h1>
                        <Link href={route('[modulo].[modelo].create')}>
                            <Button>
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Nuevo [Modelo]
                            </Button>
                        </Link>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <form onSubmit={handleBuscar} className="flex gap-4">
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar..."
                                className="flex-1 rounded-md border-gray-300"
                            />
                            <Button type="submit">Buscar</Button>
                        </form>
                    </div>

                    {/* Tabla */}
                    <div className="bg-white rounded-lg shadow">
                        <DataTable
                            columns={columns}
                            data={registros.data}
                            pagination={registros.meta}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

---

## 🗄️ SEEDERS

### Plantilla Seeder

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Config\Rol;
use App\Models\Config\Permiso;

class RolesYPermisosSeeder extends Seeder
{
    public function run(): void
    {
        // Crear permisos
        $permisos = [
            // Configuración
            ['codigo' => 'config.empresa.ver', 'nombre' => 'Ver Configuración Empresa', 'modulo' => 'configuracion', 'accion' => 'ver'],
            ['codigo' => 'config.empresa.editar', 'nombre' => 'Editar Configuración Empresa', 'modulo' => 'configuracion', 'accion' => 'editar'],
            
            // Roles
            ['codigo' => 'config.roles.ver', 'nombre' => 'Ver Roles', 'modulo' => 'configuracion', 'accion' => 'ver'],
            ['codigo' => 'config.roles.crear', 'nombre' => 'Crear Roles', 'modulo' => 'configuracion', 'accion' => 'crear'],
            
            // Usuarios
            ['codigo' => 'config.usuarios.ver', 'nombre' => 'Ver Usuarios', 'modulo' => 'configuracion', 'accion' => 'ver'],
            ['codigo' => 'config.usuarios.crear', 'nombre' => 'Crear Usuarios', 'modulo' => 'configuracion', 'accion' => 'crear'],
            
            // Clientes
            ['codigo' => 'catalogo.clientes.ver', 'nombre' => 'Ver Clientes', 'modulo' => 'catalogo', 'accion' => 'ver'],
            ['codigo' => 'catalogo.clientes.crear', 'nombre' => 'Crear Clientes', 'modulo' => 'catalogo', 'accion' => 'crear'],
            
            // Solicitudes
            ['codigo' => 'solicitud.ver', 'nombre' => 'Ver Solicitudes', 'modulo' => 'solicitud', 'accion' => 'ver'],
            ['codigo' => 'solicitud.crear', 'nombre' => 'Crear Solicitudes', 'modulo' => 'solicitud', 'accion' => 'crear'],
            ['codigo' => 'solicitud.autorizar', 'nombre' => 'Autorizar Solicitudes', 'modulo' => 'solicitud', 'accion' => 'autorizar'],
            
            // Caja
            ['codigo' => 'caja.acceder', 'nombre' => 'Acceder a Caja', 'modulo' => 'caja', 'accion' => 'acceder'],
            ['codigo' => 'caja.cerrar_con_diferencia', 'nombre' => 'Cerrar Caja con Diferencia', 'modulo' => 'caja', 'accion' => 'cerrar'],
        ];

        foreach ($permisos as $permiso) {
            Permiso::create($permiso);
        }

        // Crear roles
        $roles = [
            [
                'codigo' => 'ADMIN',
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema',
                'nivel_jerarquico' => 2,
                'puede_modificar_autorizados' => true,
                'requiere_clave_diaria' => true,
                'puede_cerrar_caja_con_diferencia' => true,
                'es_sistema' => true,
                'permisos' => Permiso::all()->pluck('id'),
            ],
            [
                'codigo' => 'SUPERVISOR',
                'nombre' => 'Supervisor',
                'descripcion' => 'Supervisa operaciones y autoriza',
                'nivel_jerarquico' => 3,
                'puede_modificar_autorizados' => true,
                'requiere_clave_diaria' => true,
                'puede_cerrar_caja_con_diferencia' => true,
                'es_sistema' => true,
                'permisos' => Permiso::whereIn('codigo', [
                    'solicitud.ver', 'solicitud.autorizar',
                    'caja.acceder', 'caja.cerrar_con_diferencia',
                ])->pluck('id'),
            ],
            [
                'codigo' => 'CAJERO',
                'nombre' => 'Cajero',
                'descripcion' => 'Maneja caja y pagos',
                'nivel_jerarquico' => 5,
                'es_sistema' => true,
                'permisos' => Permiso::whereIn('codigo', [
                    'caja.acceder', 'catalogo.clientes.ver',
                ])->pluck('id'),
            ],
            [
                'codigo' => 'VENDEDOR',
                'nombre' => 'Vendedor',
                'descripcion' => 'Crea solicitudes',
                'nivel_jerarquico' => 6,
                'es_sistema' => true,
                'permisos' => Permiso::whereIn('codigo', [
                    'solicitud.ver', 'solicitud.crear',
                    'catalogo.clientes.ver', 'catalogo.clientes.crear',
                ])->pluck('id'),
            ],
        ];

        foreach ($roles as $rolData) {
            $permisos = $rolData['permisos'];
            unset($rolData['permisos']);
            
            $rol = Rol::create($rolData);
            $rol->permisos()->attach($permisos);
        }
    }
}
```

---

**Nota:** Estas plantillas están listas para copiar y adaptar. Solo reemplaza los placeholders ([Modelo], [Modulo], etc.) con los valores correctos.
