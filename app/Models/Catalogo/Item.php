<?php

namespace App\Models\Catalogo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $table = 'cat__items';

    protected $fillable = [
        'erp_id',
        'codigo',
        'nombre',
        'descripcion',
        'tipo',
        'categoria_id',
        'categoria_erp',
        'precio_base',
        'precio_venta',
        'costo',
        'unidad_medida',
        'iva',
        'tiempo_estimado_servicio',
        'imagen',
        'activo',
        'permite_edicion',
        // Campos de inventario (extensión)
        'maneja_inventario',
        'stock_actual',
        'stock_minimo',
    ];

    protected $casts = [
        'precio_base' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'costo' => 'decimal:2',
        'iva' => 'decimal:2',
        'tiempo_estimado_servicio' => 'integer',
        'maneja_inventario' => 'boolean',
        'stock_actual' => 'integer',
        'stock_minimo' => 'integer',
        'activo' => 'boolean',
        'permite_edicion' => 'boolean',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Categoría del item
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaItem::class, 'categoria_id');
    }

    /**
     * Items en solicitudes
     */
    public function solicitudesItems(): HasMany
    {
        return $this->hasMany(\App\Models\Documento\SolicitudItem::class, 'item_id');
    }

    /**
     * Items en órdenes de servicio
     */
    public function ordenesServicioItems(): HasMany
    {
        return $this->hasMany(\App\Models\Documento\OrdenServicioItem::class, 'item_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Items activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: Por tipo (producto o servicio)
     */
    public function scopeTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope: Por categoría
     */
    public function scopeCategoria($query, int $categoriaId)
    {
        return $query->where('categoria_id', $categoriaId);
    }

    /**
     * Scope: Con stock bajo
     */
    public function scopeConStockBajo($query)
    {
        return $query->where('maneja_inventario', true)
                     ->whereRaw('stock_actual <= stock_minimo');
    }

    /**
     * Scope: Buscar por término
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('codigo', 'like', "%{$termino}%")
              ->orWhere('nombre', 'like', "%{$termino}%")
              ->orWhere('descripcion', 'like', "%{$termino}%");
        });
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Verificar si es producto
     */
    public function esProducto(): bool
    {
        return $this->tipo === 'producto';
    }

    /**
     * Verificar si es servicio
     */
    public function esServicio(): bool
    {
        return $this->tipo === 'servicio';
    }

    /**
     * Verificar si tiene stock disponible
     */
    public function tieneStock(int $cantidad = 1): bool
    {
        if (!$this->maneja_inventario) {
            return true; // Los servicios no requieren stock
        }

        return $this->stock_actual >= $cantidad;
    }

    /**
     * Verificar si está por debajo del stock mínimo
     */
    public function stockBajo(): bool
    {
        return $this->maneja_inventario && $this->stock_actual <= $this->stock_minimo;
    }

    /**
     * Descontar stock
     */
    public function descontarStock(int $cantidad): void
    {
        if ($this->maneja_inventario) {
            $this->decrement('stock_actual', $cantidad);
        }
    }

    /**
     * Agregar stock
     */
    public function agregarStock(int $cantidad): void
    {
        if ($this->maneja_inventario) {
            $this->increment('stock_actual', $cantidad);
        }
    }

    /**
     * Calcular precio con IVA
     */
    public function getPrecioConIva(): float
    {
        return $this->precio_venta * (1 + ($this->iva / 100));
    }

    /**
     * Calcular precio con descuento
     */
    public function calcularPrecioConDescuento(float $porcentajeDescuento): float
    {
        $descuento = $this->precio_venta * ($porcentajeDescuento / 100);
        return $this->precio_venta - $descuento;
    }

    /**
     * Verificar si permite edición de precio
     */
    public function permiteEdicionPrecio(): bool
    {
        return $this->permite_edicion;
    }

    /**
     * Verificar si está sincronizado con ERP
     */
    public function estaSincronizado(): bool
    {
        return !empty($this->erp_id);
    }
}
