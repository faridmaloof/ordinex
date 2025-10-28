<?php

namespace App\Models\Catalogo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormaPago extends Model
{
    protected $table = 'cat__formas_pago';

    protected $fillable = [
        'codigo',
        'nombre',
        'requiere_referencia',
        'requiere_autorizacion',
        'activo',
        'orden',
    ];

    protected $casts = [
        'requiere_referencia' => 'boolean',
        'requiere_autorizacion' => 'boolean',
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Pagos realizados con esta forma de pago
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(\App\Models\Transaccion\Pago::class, 'forma_pago_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Formas de pago activas
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: Ordenadas por campo 'orden'
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden');
    }

    /**
     * Scope: Que requieren referencia
     */
    public function scopeConReferencia($query)
    {
        return $query->where('requiere_referencia', true);
    }

    /**
     * Scope: Que requieren autorización
     */
    public function scopeConAutorizacion($query)
    {
        return $query->where('requiere_autorizacion', true);
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Verificar si es efectivo
     */
    public function esEfectivo(): bool
    {
        return strtoupper($this->codigo) === 'EFECTIVO';
    }

    /**
     * Verificar si requiere datos adicionales
     */
    public function requiereDatosAdicionales(): bool
    {
        return $this->requiere_referencia || $this->requiere_autorizacion;
    }
}
