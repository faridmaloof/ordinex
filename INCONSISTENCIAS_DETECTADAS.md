# Inconsistencias Detectadas - Auditoría DB/Modelos

## 📋 TABLA: clientes (cat__clientes)

### ❌ Migración vs CSV Oficial
**Migración actual:**
- ✅ tipo_documento
- ✅ numero_documento
- ❌ nombre_completo (debería ser: nombre)
- ❌ razon_social (debería eliminarse o convertirse en tipo_cliente)
- ✅ email
- ✅ telefono
- ✅ celular
- ✅ direccion
- ❌ FALTA: ciudad
- ❌ FALTA: departamento
- ❌ FALTA: tipo_cliente (ENUM: natural, juridico)
- ❌ FALTA: erp_id
- ❌ FALTA: vendedor_id
- ❌ FALTA: limite_credito
- ❌ FALTA: sincronizado_erp
- ✅ saldo_favor
- ✅ observaciones
- ✅ activo

**Modelo actual - Campos fillable incorrectos:**
- ❌ codigo (NO EXISTE en migración ni CSV)
- ✅ tipo_documento
- ✅ numero_documento
- ❌ razon_social (existe en migración pero no en CSV oficial)
- ❌ nombre_comercial (NO EXISTE en migración)
- ✅ telefono
- ✅ email
- ✅ direccion
- ❌ ciudad (NO EXISTE en migración actual - DEBE AGREGARSE)
- ❌ departamento (NO EXISTE en migración actual - DEBE AGREGARSE)
- ❌ pais (NO EXISTE en CSV oficial - DEBE ELIMINARSE)
- ❌ limite_credito (NO EXISTE en migración actual - DEBE AGREGARSE)
- ❌ dias_credito (NO EXISTE en CSV oficial)
- ❌ saldo_pendiente (NO EXISTE en CSV oficial)
- ✅ saldo_favor
- ✅ activo
- ✅ observaciones

**Casts incorrectos:**
- ❌ limite_credito (no existe en migración)
- ❌ dias_credito (no existe en CSV)
- ❌ saldo_pendiente (no existe en CSV)

---

## 📋 TABLA: items (cat__items)

### ❌ Migración vs CSV Oficial
**Migración actual:**
- ✅ codigo
- ✅ nombre
- ✅ descripcion
- ✅ tipo
- ✅ categoria_id
- ✅ precio_base
- ✅ costo
- ❌ aplica_iva (debería ser: iva como decimal)
- ❌ porcentaje_iva (debería eliminarse, solo "iva")
- ❌ tiempo_estimado (debería ser: tiempo_estimado_servicio)
- ❌ requiere_autorizacion (NO EXISTE en CSV oficial)
- ❌ maneja_inventario (NO EXISTE en CSV oficial)
- ❌ stock_actual (NO EXISTE en CSV oficial)
- ❌ stock_minimo (NO EXISTE en CSV oficial)
- ✅ unidad_medida
- ✅ activo
- ❌ FALTA: erp_id
- ❌ FALTA: categoria_erp
- ❌ FALTA: precio_venta (diferente de precio_base)
- ❌ FALTA: imagen
- ❌ FALTA: permite_edicion

**Modelo actual - Campos fillable incorrectos:**
- ✅ codigo
- ✅ nombre
- ✅ descripcion
- ✅ categoria_id
- ✅ tipo
- ✅ unidad_medida
- ✅ precio_base
- ❌ tiempo_estimado_minutos (en migración es tiempo_estimado)
- ❌ requiere_inventario (en migración es maneja_inventario)
- ❌ stock_actual (decimal en modelo, integer en migración - NO EXISTE EN CSV)
- ❌ stock_minimo (decimal en modelo, integer en migración - NO EXISTE EN CSV)
- ✅ activo
- ❌ imagen (NO EXISTE en migración - DEBE AGREGARSE)

**Casts incorrectos:**
- ❌ stock_actual (decimal:2 en modelo, integer en migración, NO EXISTE en CSV)
- ❌ stock_minimo (decimal:2 en modelo, integer en migración, NO EXISTE en CSV)

---

## 📋 TABLA: categorias_items (cat__categorias_items)

### ❌ Migración vs CSV Oficial
**Migración actual:**
- ✅ codigo
- ✅ nombre
- ✅ descripcion
- ❌ tipo (NO EXISTE en CSV oficial)
- ✅ categoria_padre_id
- ❌ activa (debería ser: activo)

**Modelo actual - Campos fillable incorrectos:**
- ✅ codigo
- ✅ nombre
- ✅ descripcion
- ✅ categoria_padre_id
- ❌ nivel (NO EXISTE en migración ni CSV)
- ❌ activo (en migración es: activa)

---

## 🎯 PLAN DE CORRECCIÓN

### Fase 1: Actualizar Migraciones (Base de Datos)
1. ✅ Cliente: Actualizar campos según CSV oficial
2. ✅ Items: Eliminar campos de inventario, agregar campos faltantes
3. ✅ CategoriaItem: Cambiar "activa" por "activo", eliminar "tipo"

### Fase 2: Actualizar Modelos
1. ✅ Cliente.php: Corregir fillable y casts
2. ✅ Item.php: Corregir fillable y casts
3. ✅ CategoriaItem.php: Corregir fillable y casts

### Fase 3: Actualizar Controllers (Requests)
1. ✅ Verificar reglas de validación
2. ✅ Actualizar lógica de negocio

### Fase 4: Actualizar Frontend
1. ✅ Formularios (Create/Edit)
2. ✅ DataTables (Index)
3. ✅ Vistas de detalle (Show)

---

## ⚠️ NOTAS IMPORTANTES

### Campos de Inventario (Stock)
Los campos `stock_actual`, `stock_minimo`, `maneja_inventario` NO EXISTEN en el CSV oficial.
**Decisión:** Mantenerlos por ahora ya que:
- El frontend ya está implementado con AjustarStock modal
- Existe lógica de negocio para manejo de inventario
- Se puede considerar como extensión del sistema base

**Alternativa:** Si se desean eliminar, habría que:
1. Eliminar campos de migración
2. Eliminar del modelo
3. Eliminar AjustarStockModal del frontend
4. Actualizar ItemsController

### Campo nombre vs nombre_completo (Clientes)
CSV oficial usa: `nombre` (VARCHAR 255)
Migración actual usa: `nombre_completo` + `razon_social`

**Decisión:** Seguir CSV oficial:
- Un solo campo `nombre` que contiene nombre completo o razón social
- Campo `tipo_cliente` (ENUM: natural, juridico) indica el tipo
- Simplifica la lógica

### Ciudad y Departamento
Estos campos SÍ EXISTEN en el CSV oficial (líneas 80-81)
Deben agregarse a la migración de clientes.
