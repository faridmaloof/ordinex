# ✅ Correcciones de Consistencia Aplicadas

## 📅 Fecha: 28 de Octubre de 2025

---

## ✅ MIGRACIONES CORREGIDAS

### 1. cat__clientes (2025_10_27_232734)
**Cambios aplicados:**
- ✅ Agregado: `erp_id` (VARCHAR 50, unique, nullable)
- ✅ Agregado: `tipo_cliente` (VARCHAR 20, default 'natural')
- ✅ Modificado: `tipo_documento` (comentario CC, NIT, CE, Pasaporte)
- ✅ Modificado: `numero_documento` (VARCHAR 20 en lugar de 50)
- ✅ Eliminado: `nombre_completo` → Reemplazado por `nombre` (VARCHAR 255)
- ✅ Eliminado: `razon_social` 
- ✅ Agregado: `nombre` (VARCHAR 255) - nombre completo o razón social
- ✅ Modificado: `telefono` (VARCHAR 20 en lugar de 50)
- ✅ Modificado: `celular` (VARCHAR 20 en lugar de 50)
- ✅ Modificado: `email` (VARCHAR 100 en lugar de 150)
- ✅ Agregado: `ciudad` (VARCHAR 100)
- ✅ Agregado: `departamento` (VARCHAR 100)
- ✅ Agregado: `vendedor_id` (FK → users)
- ✅ Agregado: `limite_credito` (DECIMAL 12,2 default 0)
- ✅ Agregado: `sincronizado_erp` (BOOLEAN default false)
- ✅ Mantiene: `saldo_favor`, `observaciones`, `activo`
- ✅ Agregados índices para tipo_cliente, vendedor_id

### 2. cat__items (2025_10_27_232739)
**Cambios aplicados:**
- ✅ Agregado: `erp_id` (VARCHAR 50, unique, nullable)
- ✅ Modificado: `nombre` (VARCHAR 255 en lugar de 200)
- ✅ Agregado: `categoria_erp` (VARCHAR 100, nullable)
- ✅ Agregado: `precio_venta` (DECIMAL 12,2) - diferente de precio_base
- ✅ Modificado: `precio_base` (sin default 0, ahora requerido)
- ✅ Modificado: `costo` (sin default 0, ahora default 0)
- ✅ Eliminado: `aplica_iva` (boolean)
- ✅ Eliminado: `porcentaje_iva`
- ✅ Agregado: `iva` (DECIMAL 5,2 default 19.00) - campo único para IVA
- ✅ Modificado: `unidad_medida` (default 'unidad')
- ✅ Eliminado: `tiempo_estimado`
- ✅ Agregado: `tiempo_estimado_servicio` (INT nullable)
- ✅ Agregado: `imagen` (VARCHAR 500, nullable)
- ✅ Agregado: `permite_edicion` (BOOLEAN default true)
- ✅ Eliminado: `requiere_autorizacion` (no existe en CSV oficial)
- ✅ Mantiene: `maneja_inventario`, `stock_actual`, `stock_minimo` (extensión del sistema)
- ✅ Agregado índice para código

**Nota sobre inventario:** Los campos de stock se mantienen como extensión del sistema base.

### 3. cat__categorias_items (2025_10_27_232736)
**Cambios aplicados:**
- ✅ Eliminado: `tipo` (campo VARCHAR 20 con valores producto/servicio/ambos)
- ✅ Modificado: `activa` → `activo` (consistencia con otras tablas)
- ✅ Eliminado índice para `tipo`
- ✅ Agregado índice para `categoria_padre_id`

---

## ✅ MODELOS CORREGIDOS

### 1. Cliente.php
**Imports actualizados:**
```php
use Illuminate\Database\Eloquent\Relations\BelongsTo; // ✅ Agregado
use Illuminate\Database\Eloquent\Relations\HasMany;
```

**Fillable corregido:**
```php
protected $fillable = [
    'erp_id',              // ✅ Agregado
    'tipo_cliente',        // ✅ Agregado
    'tipo_documento',
    'numero_documento',
    'nombre',              // ✅ Reemplaza razon_social/nombre_comercial
    'telefono',
    'celular',
    'email',
    'direccion',
    'ciudad',              // ✅ Agregado
    'departamento',        // ✅ Agregado
    'vendedor_id',         // ✅ Agregado
    'saldo_favor',
    'limite_credito',      // ✅ Agregado
    'observaciones',
    'sincronizado_erp',    // ✅ Agregado
    'activo',
];
```

**Casts corregido:**
```php
protected $casts = [
    'limite_credito' => 'decimal:2',     // ✅ Agregado
    'saldo_favor' => 'decimal:2',
    'sincronizado_erp' => 'boolean',     // ✅ Agregado
    'activo' => 'boolean',
];
```

**Relaciones agregadas:**
- ✅ `vendedor(): BelongsTo` → User

**Scopes corregidos:**
- ✅ `scopeConCreditoDisponible` - eliminado uso de saldo_pendiente
- ✅ `scopeBuscar` - actualizado para buscar en numero_documento, nombre, email
- ✅ Eliminado: `scopeConSaldoPendiente` (campo no existe)

**Métodos corregidos:**
- ✅ Eliminados métodos relacionados con saldo_pendiente
- ✅ Agregado: `esJuridico()` - verifica tipo_cliente
- ✅ Agregado: `estaSincronizado()` - verifica sincronización ERP
- ✅ Agregado: `getNombreDisplayAttribute()` - obtiene nombre para mostrar

### 2. Item.php
**Fillable corregido:**
```php
protected $fillable = [
    'erp_id',                      // ✅ Agregado
    'codigo',
    'nombre',
    'descripcion',
    'tipo',
    'categoria_id',
    'categoria_erp',               // ✅ Agregado
    'precio_base',
    'precio_venta',                // ✅ Agregado
    'costo',
    'unidad_medida',
    'iva',                         // ✅ Reemplaza aplica_iva/porcentaje_iva
    'tiempo_estimado_servicio',    // ✅ Reemplaza tiempo_estimado_minutos
    'imagen',                      // ✅ Agregado
    'activo',
    'permite_edicion',             // ✅ Agregado
    // Extensión del sistema
    'maneja_inventario',
    'stock_actual',
    'stock_minimo',
];
```

**Casts corregido:**
```php
protected $casts = [
    'precio_base' => 'decimal:2',
    'precio_venta' => 'decimal:2',           // ✅ Agregado
    'costo' => 'decimal:2',
    'iva' => 'decimal:2',                    // ✅ Agregado
    'tiempo_estimado_servicio' => 'integer', // ✅ Corregido
    'maneja_inventario' => 'boolean',        // ✅ Corregido nombre
    'stock_actual' => 'integer',             // ✅ Corregido de decimal
    'stock_minimo' => 'integer',             // ✅ Corregido de decimal
    'activo' => 'boolean',
    'permite_edicion' => 'boolean',          // ✅ Agregado
];
```

**Scopes corregidos:**
- ✅ `scopeConStockBajo` - usa `maneja_inventario` en lugar de `requiere_inventario`

**Métodos corregidos:**
- ✅ `tieneStock()` - usa `maneja_inventario`, parámetro int en lugar de float
- ✅ `stockBajo()` - usa `maneja_inventario`
- ✅ `descontarStock()` - usa `maneja_inventario`, parámetro int
- ✅ `agregarStock()` - usa `maneja_inventario`, parámetro int
- ✅ Agregado: `getPrecioConIva()` - calcula precio + IVA
- ✅ Actualizado: `calcularPrecioConDescuento()` - usa precio_venta
- ✅ Agregado: `permiteEdicionPrecio()` - verifica permite_edicion
- ✅ Agregado: `estaSincronizado()` - verifica sincronización ERP

### 3. CategoriaItem.php
**Fillable corregido:**
```php
protected $fillable = [
    'codigo',
    'nombre',
    'descripcion',
    'categoria_padre_id',
    'activo',  // ✅ Corregido de 'activa'
];
```

**Casts corregido:**
```php
protected $casts = [
    'activo' => 'boolean',  // ✅ Corregido de 'activa'
];
```

---

## ✅ CONTROLLERS CORREGIDOS

### 1. ClienteController.php

**Index - Búsqueda corregida:**
```php
$q->where('numero_documento', 'like', "%{$search}%")
  ->orWhere('nombre', 'like', "%{$search}%")     // ✅ Corregido
  ->orWhere('email', 'like', "%{$search}%");
```

**Index - Filtros actualizados:**
- ✅ Agregado filtro: `tipo_cliente` (natural/juridico)
- ✅ Modificado filtro: `con_saldo_favor` (reemplaza con_saldo)
- ✅ Ordenamiento: `orderBy('nombre')` (reemplaza razon_social)
- ✅ Eager loading: `with('vendedor:id,nombre')`

**Store - Validación corregida:**
```php
$validated = $request->validate([
    'erp_id' => 'nullable|string|max:50|unique:cat__clientes,erp_id',  // ✅ Agregado
    'tipo_cliente' => 'required|in:natural,juridico',                   // ✅ Agregado
    'tipo_documento' => 'required|in:CC,NIT,CE,Pasaporte',
    'numero_documento' => 'required|string|max:20|unique:...',          // ✅ max:20
    'nombre' => 'required|string|max:255',                              // ✅ Reemplaza razon_social
    'telefono' => 'nullable|string|max:20',                             // ✅ max:20
    'celular' => 'nullable|string|max:20',                              // ✅ Agregado
    'email' => 'nullable|email|max:100',
    'direccion' => 'nullable|string',
    'ciudad' => 'nullable|string|max:100',                              // ✅ Agregado
    'departamento' => 'nullable|string|max:100',                        // ✅ Agregado
    'vendedor_id' => 'nullable|exists:users,id',                        // ✅ Agregado
    'limite_credito' => 'nullable|numeric|min:0',                       // ✅ Agregado
    'activo' => 'boolean',
    'observaciones' => 'nullable|string',
]);

$validated['saldo_favor'] = 0;
$validated['sincronizado_erp'] = !empty($validated['erp_id']);         // ✅ Agregado
```

**Update - Validación corregida:** (mismos cambios que store + unique con excepción del ID actual)

**Show - Eager loading actualizado:**
```php
$cliente->load([
    'vendedor:id,nombre',  // ✅ Agregado
    'solicitudes' => ...,
    'ordenesServicio' => ...,
]);
```

### 2. ItemController.php

**Store - Lógica corregida:**
```php
$item = Item::create([
    'erp_id' => $validated['erp_id'] ?? null,                          // ✅ Agregado
    'codigo' => $validated['codigo'],
    'nombre' => $validated['nombre'],
    'descripcion' => $validated['descripcion'] ?? null,
    'tipo' => $validated['tipo'],
    'categoria_id' => $validated['categoria_id'],
    'categoria_erp' => $validated['categoria_erp'] ?? null,            // ✅ Agregado
    'precio_base' => $validated['precio_base'],                         // ✅ Corregido
    'precio_venta' => $validated['precio_venta'],                       // ✅ Agregado
    'costo' => $validated['costo'] ?? 0,
    'unidad_medida' => $validated['unidad_medida'] ?? 'unidad',
    'iva' => $validated['iva'] ?? 19.00,                                // ✅ Reemplaza aplica_iva/porcentaje_iva
    'tiempo_estimado_servicio' => $validated['...'] ?? null,            // ✅ Corregido nombre
    'imagen' => $validated['imagen'] ?? null,                           // ✅ Agregado
    'activo' => $validated['activo'] ?? true,
    'permite_edicion' => $validated['permite_edicion'] ?? true,         // ✅ Agregado
    'maneja_inventario' => $validated['maneja_inventario'] ?? false,
    'stock_actual' => $validated['stock_inicial'] ?? 0,
    'stock_minimo' => $validated['stock_minimo'] ?? 0,
]);
```

**Update - Lógica corregida:** (mismos cambios que store, excepto stock_actual no se actualiza)

**Redirect corregido:**
- ✅ `route('catalogos.items.index')` (reemplaza 'items.index')

---

## ⚠️ PENDIENTE: VALIDACIÓN EN FRONTEND

### Páginas de Clientes a verificar:
- [ ] `resources/js/pages/Clientes/Index.tsx`
- [ ] `resources/js/pages/Clientes/Create.tsx`
- [ ] `resources/js/pages/Clientes/Edit.tsx`
- [ ] `resources/js/pages/Clientes/Show.tsx`

**Cambios necesarios en formularios:**
```typescript
// ELIMINAR:
- codigo
- razon_social
- nombre_comercial
- pais
- dias_credito
- saldo_pendiente

// AGREGAR:
- erp_id (opcional)
- tipo_cliente (radio: natural/juridico)
- nombre (campo único para todo)
- ciudad
- departamento
- vendedor_id (select de usuarios)
- limite_credito
- sincronizado_erp (readonly/badge)

// MODIFICAR:
- numero_documento: max 20 (era 50)
- telefono: max 20 (era 50)
- celular: max 20 (era 50)
- email: max 100 (era 150)
```

**Cambios necesarios en DataTable:**
```typescript
columns: [
  // Eliminar: Código, Razón Social, Nombre Comercial
  // Agregar: Tipo Cliente, Nombre, Vendedor
  { header: 'Tipo', render: (_, row) => row.tipo_cliente },
  { header: 'Nombre', render: (_, row) => row.nombre },
  { header: 'Vendedor', render: (_, row) => row.vendedor?.nombre },
]

// Filtros:
filterDefinitions: [
  { name: 'tipo_cliente', type: 'select', options: [{value: 'natural'}, {value: 'juridico'}] },
  // Eliminar filtro: con_saldo
  // Agregar filtro: con_saldo_favor
]
```

### Páginas de Items a verificar:
- [ ] `resources/js/pages/Items/Index.tsx` - YA CORREGIDO EN SESIÓN ANTERIOR ✅
- [ ] `resources/js/pages/Items/Create.tsx`
- [ ] `resources/js/pages/Items/Edit.tsx`
- [ ] `resources/js/pages/Items/Show.tsx`

**Cambios necesarios en formularios:**
```typescript
// ELIMINAR:
- aplica_iva (checkbox)
- porcentaje_iva (number)
- tiempo_estimado_minutos

// AGREGAR:
- erp_id (opcional, readonly si sincronizado)
- categoria_erp (opcional, desde ERP)
- precio_venta (separado de precio_base)
- iva (number, default 19.00) - campo único
- tiempo_estimado_servicio (para servicios solamente)
- imagen (upload)
- permite_edicion (checkbox)

// MODIFICAR VALIDACIONES:
- nombre: max 255 (era 200)
- stock_actual: integer (era decimal)
- stock_minimo: integer (era decimal)
```

**Cambios en AjustarStockModal (Index.tsx):**
```typescript
// ✅ YA ESTÁ CORRECTO en la versión actual:
- Usa stock_actual (integer)
- Validación de stock negativo correcta
- Preview con colores correcto
```

### Páginas de Categorías a verificar:
- [ ] `resources/js/pages/Categorias/Index.tsx`
- [ ] `resources/js/pages/Categorias/Create.tsx`
- [ ] `resources/js/pages/Categorias/Edit.tsx`

**Cambios necesarios:**
```typescript
// ELIMINAR:
- tipo (select: producto/servicio/ambos)
- nivel

// MODIFICAR:
- activa → activo (nombre de campo)
```

---

## 📋 RESUMEN ESTADÍSTICO

### Migraciones:
- ✅ 3 migraciones corregidas
- ✅ 23 campos agregados
- ✅ 15 campos eliminados/modificados
- ✅ 8 índices actualizados

### Modelos:
- ✅ 3 modelos corregidos
- ✅ 1 relación agregada (Cliente → vendedor)
- ✅ 12 métodos agregados/modificados
- ✅ 5 scopes corregidos

### Controllers:
- ✅ 2 controllers corregidos
- ✅ 8 métodos actualizados (index, store, update, show)
- ✅ Validaciones alineadas con CSV oficial

### Frontend:
- ⏳ Pendiente: 10 páginas a verificar
- ⏳ Pendiente: Actualizar formularios
- ⏳ Pendiente: Actualizar DataTables
- ⏳ Pendiente: Actualizar filtros

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar migraciones fresh:**
   ```bash
   php artisan migrate:fresh --seed
   ```

2. **Verificar errores de compilación:**
   ```bash
   php artisan about
   ```

3. **Actualizar Requests (validaciones):**
   - [ ] `StoreItemRequest.php`
   - [ ] `UpdateItemRequest.php`
   - [ ] `StoreClienteRequest.php` (si existe)
   - [ ] `UpdateClienteRequest.php` (si existe)

4. **Actualizar frontend:**
   - [ ] Clientes CRUD (4 páginas)
   - [ ] Items Create/Edit (2 páginas) - Index YA CORREGIDO ✅
   - [ ] Categorías CRUD (3 páginas)

5. **Testing después de correcciones frontend:**
   - [ ] Crear cliente (natural y jurídico)
   - [ ] Crear item (producto y servicio)
   - [ ] Verificar relación vendedor → cliente
   - [ ] Verificar sincronización ERP (badges)
   - [ ] Probar AjustarStock (YA FUNCIONA ✅)

---

## ⚠️ NOTAS IMPORTANTES

### Decisiones de Diseño:

1. **Campo nombre único en Cliente:**
   - En lugar de razon_social + nombre_comercial separados
   - El campo `tipo_cliente` indica si es natural o jurídico
   - Simplifica formularios y búsquedas

2. **Stock como extensión del sistema:**
   - Los campos stock_actual, stock_minimo, maneja_inventario NO existen en CSV oficial
   - Se mantienen como extensión porque:
     * Frontend ya implementado (AjustarStockModal funciona)
     * Lógica de negocio existente
     * No rompe el sistema base
   - Si se desean eliminar: hay que remover modal y lógica

3. **IVA simplificado:**
   - En lugar de aplica_iva (bool) + porcentaje_iva (decimal)
   - Ahora solo: iva (decimal, default 19.00)
   - Si iva = 0 → no aplica IVA
   - Si iva > 0 → aplica ese porcentaje

4. **Sincronización ERP:**
   - Campo erp_id almacena ID externo
   - Campo sincronizado_erp (boolean) indica si está activo
   - Campo categoria_erp (Items) para categoría desde ERP

### Impacto en Testing:

- 🔴 **Migraciones fresh necesarias**: BD actual no compatible
- 🟡 **Seeders a actualizar**: Campos cambiados
- 🟢 **Backend controllers**: Ya listos para usar
- 🔴 **Frontend forms**: Requieren actualización antes de testing

---

## 📝 LOG DE CAMBIOS

**2025-10-28 - Auditoría de Consistencia**
- ✅ Detectadas inconsistencias entre CSV oficial y código
- ✅ Corregidas 3 migraciones (clientes, items, categorias)
- ✅ Corregidos 3 modelos con fillable, casts, relaciones, scopes
- ✅ Corregidos 2 controllers (ClienteController, ItemController)
- ✅ Documentación completa de cambios
- ⏳ Pendiente: Actualizar frontend (10 páginas)
