<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Catalogo\Item;

class SolicitudItem extends Model
{
    protected $table = 'doc__solicitudes_items';

    protected $fillable = [
        'solicitud_id',
        'item_id',
        'cantidad',
        'precio_unitario',
        'porcentaje_descuento',
        'descuento',
        'iva',
        'total',
        'observaciones',
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'porcentaje_descuento' => 'decimal:2',
        'descuento' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Solicitud a la que pertenece
     */
    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(Solicitud::class, 'solicitud_id');
    }

    /**
     * Item (producto/servicio)
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Calcular totales del item
     */
    public function calcularTotales(): void
    {
        $subtotal = $this->cantidad * $this->precio_unitario;
        $descuento = $subtotal * ($this->porcentaje_descuento / 100);
        $base = $subtotal - $descuento;
        $iva = $base * 0.19;
        $total = $base + $iva;

        $this->update([
            'descuento' => $descuento,
            'iva' => $iva,
            'total' => $total,
        ]);
    }

    /**
     * Obtener subtotal (sin descuento ni IVA)
     */
    public function getSubtotal(): float
    {
        return $this->cantidad * $this->precio_unitario;
    }
}
