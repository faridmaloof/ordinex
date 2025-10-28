# 📚 SISTEMA CRUD ESTANDARIZADO - GUÍA COMPLETA

## 🎯 Descripción General

Este sistema proporciona componentes reutilizables para crear CRUDs completos con:
- ✅ Paginación dinámica (5, 10, 20, 50, 100 registros)
- ✅ Búsqueda en tiempo real (sin recargar página)
- ✅ Filtros configurables
- ✅ Acciones personalizables (View, Edit, Delete, Custom)
- ✅ Hooks de Inertia (AJAX automático)
- ✅ Diseño responsive y profesional

---

## 📦 Componentes del Sistema

### 1. **DataTableAdvanced** - Tabla Inteligente

**Ubicación:** `resources/js/components/DataTable/DataTableAdvanced.tsx`

#### Props Principales:

```typescript
interface DataTableAdvancedProps<T> {
    data: T[];                          // Datos a mostrar
    columns: Column<T>[];               // Definición de columnas
    actions?: Action<T>[];              // Botones de acción
    pagination: PaginationMeta;         // Metadata de paginación de Laravel
    filters?: Filter[];                 // Filtros configurables
    currentFilters?: Record<string, any>; // Filtros activos actuales
    searchable?: boolean;               // Habilitar búsqueda (default: true)
    searchPlaceholder?: string;         // Placeholder de búsqueda
    searchFields?: string[];            // Campos que se buscan (solo para mostrar)
    perPageOptions?: number[];          // Opciones de paginación (default: [5, 10, 20, 50, 100])
    routeName: string;                  // Nombre de la ruta para navegación
    emptyMessage?: string;              // Mensaje cuando no hay datos
}
```

#### Definición de Columnas:

```typescript
interface Column<T> {
    header: string;                     // Título de la columna
    accessor?: keyof T | ((row: T) => any); // Campo a mostrar
    render?: (value: any, row: T) => ReactNode; // Render personalizado
    sortable?: boolean;                 // ¿Ordenable? (futuro)
    className?: string;                 // Clases CSS adicionales
}
```

#### Ejemplo de columnas:

```typescript
const columns: Column<CategoriaItem>[] = [
    {
        header: 'Código',
        accessor: 'codigo',
        className: 'font-mono',
    },
    {
        header: 'Nombre',
        accessor: 'nombre',
        render: (value, row) => (
            <div>
                <div className="font-medium">{value}</div>
                {row.padre && (
                    <div className="text-xs text-gray-500">
                        Padre: {row.padre.nombre}
                    </div>
                )}
            </div>
        ),
    },
    {
        header: 'Estado',
        accessor: 'activo',
        render: (value) => (
            <EstadoBadge estado={value ? 'activo' : 'inactivo'} />
        ),
    },
];
```

---

#### Definición de Acciones:

```typescript
interface Action<T> {
    label: string;                      // Texto del botón
    icon?: ReactNode;                   // Icono (lucide-react)
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    onClick?: (row: T) => void;         // Handler onClick
    href?: (row: T) => string;          // Ruta Inertia (alternativa a onClick)
    show?: (row: T) => boolean;         // Condición para mostrar
    className?: string;                 // Clases CSS personalizadas
}
```

#### Ejemplo de acciones:

```typescript
const actions: Action<CategoriaItem>[] = [
    {
        label: 'Ver',
        icon: <Eye className="h-4 w-4" />,
        variant: 'ghost',
        size: 'sm',
        href: (row) => route('catalogos.categorias-items.show', row.id),
    },
    {
        label: 'Editar',
        icon: <Pencil className="h-4 w-4" />,
        variant: 'ghost',
        size: 'sm',
        href: (row) => route('catalogos.categorias-items.edit', row.id),
    },
    {
        label: 'Eliminar',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'ghost',
        size: 'sm',
        onClick: handleDelete,
        show: (row) => row.items_count === 0, // Solo si no tiene items
        className: 'text-red-600 hover:bg-red-50',
    },
    // ⭐ ACCIÓN PERSONALIZADA - Ejemplo
    {
        label: 'Actualizar Código',
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
        size: 'sm',
        onClick: (row) => {
            router.post(route('catalogos.categorias-items.actualizar-codigo', row.id), {}, {
                preserveScroll: true,
            });
        },
        show: (row) => row.requiere_actualizacion, // Solo si necesita actualización
    },
];
```

---

#### Definición de Filtros:

```typescript
interface Filter {
    name: string;                       // Nombre del parámetro en query string
    label: string;                      // Etiqueta visible
    type: 'text' | 'select' | 'date' | 'daterange';
    options?: { value: string; label: string }[]; // Para select
    placeholder?: string;               // Placeholder
    className?: string;                 // Clases CSS
}
```

#### Ejemplo de filtros:

```typescript
const filterDefinitions: Filter[] = [
    {
        name: 'activo',
        label: 'Estado',
        type: 'select',
        options: [
            { value: '1', label: 'Activo' },
            { value: '0', label: 'Inactivo' },
        ],
        placeholder: 'Todos',
    },
    {
        name: 'categoria_id',
        label: 'Categoría',
        type: 'select',
        options: categorias.map(c => ({
            value: c.id.toString(),
            label: c.nombre
        })),
    },
    {
        name: 'fecha_desde',
        label: 'Desde',
        type: 'date',
    },
];
```

---

### 2. **CrudLayout** - Layout Estandarizado

**Ubicación:** `resources/js/layouts/CrudLayout.tsx`

#### Props:

```typescript
interface CrudLayoutProps {
    title: string;                      // Título de la página
    description?: string;               // Descripción opcional
    createRoute?: string;               // Ruta para crear nuevo
    createLabel?: string;               // Texto del botón crear (default: "Crear Nuevo")
    showCreateButton?: boolean;         // Mostrar botón crear (default: true)
    headerActions?: ReactNode;          // Acciones adicionales en el header
    children: ReactNode;                // Contenido principal
}
```

#### Ejemplo de uso:

```typescript
<CrudLayout
    title="Categorías de Items"
    description="Administra las categorías para organizar tus items"
    createRoute={route('catalogos.categorias-items.create')}
    createLabel="Nueva Categoría"
    headerActions={
        <Button variant="outline" onClick={exportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
        </Button>
    }
>
    {/* Tu contenido aquí */}
</CrudLayout>
```

---

## 🚀 Guía de Implementación Rápida

### Paso 1: Configurar el Controller (Backend)

```php
// app/Http/Controllers/Catalogo/CategoriaItemController.php

public function index(Request $request)
{
    $query = CategoriaItem::with('padre')->orderBy('nombre');

    // Búsqueda global
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('codigo', 'like', "%{$search}%")
              ->orWhere('nombre', 'like', "%{$search}%")
              ->orWhere('descripcion', 'like', "%{$search}%");
        });
    }

    // Filtros específicos
    if ($request->filled('activo')) {
        $query->where('activo', $request->activo === '1');
    }

    // Paginación dinámica
    $perPage = $request->get('per_page', 10);
    $categorias = $query->paginate($perPage)->withQueryString();

    return Inertia::render('Catalogo/CategoriaItem/Index', [
        'categorias' => $categorias,
        'filters' => $request->only(['search', 'activo', 'per_page']),
    ]);
}
```

**⚠️ Importante:**
- Usa `->withQueryString()` para mantener filtros en la paginación
- Devuelve `filters` actual para que el frontend lo muestre
- Respeta el parámetro `per_page` del request

---

### Paso 2: Crear la Página Index (Frontend)

```tsx
// resources/js/pages/Catalogo/CategoriaItem/Index.tsx

import CrudLayout from '@/layouts/CrudLayout';
import DataTableAdvanced, { Column, Action, Filter } from '@/components/DataTable/DataTableAdvanced';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EstadoBadge } from '@/components/estado-badge';

interface CategoriaItem {
    id: number;
    codigo: string;
    nombre: string;
    // ... otros campos
}

interface Props {
    categorias: {
        data: CategoriaItem[];
        current_page: number;
        // ... otros campos de paginación
    };
    filters: Record<string, any>;
}

export default function Index({ categorias, filters = {} }: Props) {
    const { confirm, dialog } = useConfirmDialog();

    // 1. Definir columnas
    const columns: Column<CategoriaItem>[] = [
        {
            header: 'Código',
            accessor: 'codigo',
        },
        {
            header: 'Nombre',
            accessor: 'nombre',
        },
        // ... más columnas
    ];

    // 2. Definir acciones
    const actions: Action<CategoriaItem>[] = [
        {
            label: 'Ver',
            icon: <Eye className="h-4 w-4" />,
            href: (row) => route('catalogos.categorias-items.show', row.id),
        },
        // ... más acciones
    ];

    // 3. Definir filtros
    const filterDefinitions: Filter[] = [
        {
            name: 'activo',
            label: 'Estado',
            type: 'select',
            options: [
                { value: '1', label: 'Activo' },
                { value: '0', label: 'Inactivo' },
            ],
        },
    ];

    return (
        <CrudLayout
            title="Categorías"
            createRoute={route('catalogos.categorias-items.create')}
        >
            <DataTableAdvanced
                data={categorias.data}
                columns={columns}
                actions={actions}
                pagination={categorias}
                filters={filterDefinitions}
                currentFilters={filters}
                searchable
                routeName="catalogos.categorias-items.index"
            />
            {dialog}
        </CrudLayout>
    );
}
```

---

## 🎨 Ejemplos Avanzados

### Ejemplo 1: Acción Personalizada (Actualizar Código)

**Backend (Controller):**
```php
public function actualizarCodigo(CategoriaItem $categoria)
{
    $categoria->update([
        'codigo' => 'CAT-' . str_pad($categoria->id, 5, '0', STR_PAD_LEFT)
    ]);

    return back()->with('success', 'Código actualizado correctamente');
}
```

**Frontend (Acción):**
```typescript
{
    label: 'Actualizar Código',
    icon: <RefreshCw className="h-4 w-4" />,
    variant: 'outline',
    onClick: (row) => {
        router.post(route('catalogos.categorias-items.actualizar-codigo', row.id), {}, {
            preserveScroll: true,
        });
    },
    show: (row) => !row.codigo.startsWith('CAT-'), // Solo si necesita actualización
}
```

---

### Ejemplo 2: Columna con Múltiples Valores

```typescript
{
    header: 'Cliente',
    accessor: 'cliente',
    render: (value, row) => (
        <div className="space-y-1">
            <div className="font-medium">{value.razon_social}</div>
            <div className="text-xs text-gray-500">{value.nit}</div>
            <div className="text-xs text-gray-500">{value.email}</div>
        </div>
    ),
}
```

---

### Ejemplo 3: Filtro de Rango de Fechas

**Backend:**
```php
if ($request->filled('fecha_desde')) {
    $query->whereDate('fecha', '>=', $request->fecha_desde);
}
if ($request->filled('fecha_hasta')) {
    $query->whereDate('fecha', '<=', $request->fecha_hasta);
}
```

**Frontend:**
```typescript
const filterDefinitions: Filter[] = [
    {
        name: 'fecha_desde',
        label: 'Desde',
        type: 'date',
    },
    {
        name: 'fecha_hasta',
        label: 'Hasta',
        type: 'date',
    },
];
```

---

## ⚡ Características Técnicas

### Sin Recargar Página (AJAX Automático)

El componente usa `router.get()` de Inertia con opciones especiales:

```typescript
router.get(
    route(routeName),
    newFilters,
    {
        preserveState: true,     // Mantiene estado del componente
        preserveScroll: true,    // Mantiene scroll position
        only: ['data', 'pagination', 'filters'], // Solo actualiza estos props
    }
);
```

Esto significa que **solo se re-renderiza la tabla**, no toda la página.

---

### Debounce en Búsqueda

La búsqueda tiene un debounce de **500ms** para evitar requests innecesarios:

```typescript
const handleSearch = (value: string) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
        updateFilters({ ...localFilters, search: value }, true);
    }, 500);
    return () => clearTimeout(timeoutId);
};
```

---

### Paginación Dinámica

El usuario puede cambiar el número de registros por página **sin recargar**:

```tsx
<Select value={String(pagination.per_page)} onValueChange={handlePerPageChange}>
    <SelectContent>
        {[5, 10, 20, 50, 100].map((option) => (
            <SelectItem key={option} value={String(option)}>
                {option} / pág
            </SelectItem>
        ))}
    </SelectContent>
</Select>
```

---

## 📊 Comparación: Antes vs Ahora

| Característica | Antes (Código Manual) | Ahora (Estandarizado) |
|----------------|----------------------|----------------------|
| **Líneas de código** | ~300 líneas | ~100 líneas |
| **Tiempo de implementación** | 2-3 horas | 15-30 minutos |
| **Paginación** | Recarga página completa | AJAX automático |
| **Filtros** | Manejo manual de estado | Automático con debounce |
| **Acciones** | Código repetitivo | Configuración declarativa |
| **Consistencia** | Varía por módulo | 100% consistente |
| **Mantenibilidad** | Difícil (cambios en múltiples lugares) | Fácil (cambio centralizado) |

---

## 🔧 Personalización para Transacciones y Reportes

### Layout para Transacciones

```tsx
// resources/js/layouts/TransaccionLayout.tsx
import CrudLayout from '@/layouts/CrudLayout';

export default function TransaccionLayout({ title, children, ...props }) {
    return (
        <CrudLayout
            title={title}
            showCreateButton={false} // Transacciones no se "crean" desde un botón típico
            {...props}
        >
            {/* Agregar breadcrumbs o filtros de fecha predeterminados */}
            {children}
        </CrudLayout>
    );
}
```

### Layout para Reportes

```tsx
// resources/js/layouts/ReporteLayout.tsx
import { Download, Printer } from 'lucide-react';

export default function ReporteLayout({ title, onExport, onPrint, children }) {
    return (
        <CrudLayout
            title={title}
            showCreateButton={false}
            headerActions={
                <>
                    <Button variant="outline" onClick={onExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Excel
                    </Button>
                    <Button variant="outline" onClick={onPrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                </>
            }
        >
            {children}
        </CrudLayout>
    );
}
```

---

## ✅ Checklist de Implementación

Para implementar un nuevo CRUD:

- [ ] **Backend Controller:**
  - [ ] Método `index()` con paginación dinámica
  - [ ] Soporte para parámetro `per_page`
  - [ ] Búsqueda en múltiples campos (si aplica)
  - [ ] Filtros específicos del módulo
  - [ ] `->withQueryString()` en paginación
  - [ ] Retornar `filters` actual

- [ ] **Frontend Index:**
  - [ ] Import `CrudLayout` y `DataTableAdvanced`
  - [ ] Definir interfaces TypeScript
  - [ ] Configurar `columns` array
  - [ ] Configurar `actions` array
  - [ ] Configurar `filters` array (opcional)
  - [ ] Pasar props a `DataTableAdvanced`
  - [ ] Incluir `{dialog}` si usa confirmación

- [ ] **Rutas:**
  - [ ] Ruta nombrada correctamente (ej: `catalogos.categorias-items.index`)
  - [ ] Rutas de acciones (show, edit, destroy)
  - [ ] Rutas custom si hay acciones personalizadas

---

## 🚀 Próximos Pasos

1. **Ordenamiento (Sorting):** Agregar funcionalidad de ordenar columnas
2. **Exportación:** Botón de exportar a Excel/PDF integrado
3. **Selección Múltiple:** Checkbox para acciones en lote
4. **Vistas Guardadas:** Guardar combinaciones de filtros

---

**¿Necesitas ayuda?** Revisa los ejemplos en:
- `resources/js/pages/categorias-items/IndexNew.tsx` - Ejemplo completo
- `resources/js/components/DataTable/DataTableAdvanced.tsx` - Componente base

---

**Creado por:** Sistema CRUD Estandarizado v1.0
**Última actualización:** 28 de Octubre, 2025
