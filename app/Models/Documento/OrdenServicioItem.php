<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Catalogo\Item;

class OrdenServicioItem extends Model
{
    protected $table = 'doc__ordenes_servicio_items';

    protected $fillable = [
        'orden_servicio_id',
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

    public function ordenServicio(): BelongsTo
    {
        return $this->belongsTo(OrdenServicio::class, 'orden_servicio_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

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
}
