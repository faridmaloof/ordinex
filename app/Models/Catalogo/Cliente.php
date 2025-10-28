<?php

namespace App\Models\Catalogo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $table = 'cat__clientes';

    protected $fillable = [
        'codigo',
        'tipo_documento',
        'numero_documento',
        'razon_social',
        'nombre_comercial',
        'telefono',
        'email',
        'direccion',
        'ciudad',
        'departamento',
        'pais',
        'limite_credito',
        'dias_credito',
        'saldo_pendiente',
        'saldo_favor',
        'activo',
        'observaciones',
    ];

    protected $casts = [
        'limite_credito' => 'decimal:2',
        'dias_credito' => 'integer',
        'saldo_pendiente' => 'decimal:2',
        'saldo_favor' => 'decimal:2',
        'activo' => 'boolean',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Solicitudes del cliente
     */
    public function solicitudes(): HasMany
    {
        return $this->hasMany(\App\Models\Documento\Solicitud::class, 'cliente_id');
    }

    /**
     * Órdenes de servicio del cliente
     */
    public function ordenesServicio(): HasMany
    {
        return $this->hasMany(\App\Models\Documento\OrdenServicio::class, 'cliente_id');
    }

    /**
     * Pagos realizados por el cliente
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(\App\Models\Transaccion\Pago::class, 'cliente_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Clientes activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: Clientes con crédito disponible
     */
    public function scopeConCreditoDisponible($query)
    {
        return $query->whereRaw('(limite_credito - saldo_pendiente) > 0');
    }

    /**
     * Scope: Clientes con saldo pendiente
     */
    public function scopeConSaldoPendiente($query)
    {
        return $query->where('saldo_pendiente', '>', 0);
    }

    /**
     * Scope: Buscar por término
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('codigo', 'like', "%{$termino}%")
              ->orWhere('numero_documento', 'like', "%{$termino}%")
              ->orWhere('razon_social', 'like', "%{$termino}%")
              ->orWhere('nombre_comercial', 'like', "%{$termino}%");
        });
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Obtener crédito disponible
     */
    public function getCreditoDisponible(): float
    {
        return max(0, $this->limite_credito - $this->saldo_pendiente);
    }

    /**
     * Verificar si tiene crédito disponible
     */
    public function tieneCreditoDisponible(float $monto = 0): bool
    {
        return $this->getCreditoDisponible() >= $monto;
    }

    /**
     * Agregar saldo pendiente
     */
    public function agregarSaldoPendiente(float $monto): void
    {
        $this->increment('saldo_pendiente', $monto);
    }

    /**
     * Reducir saldo pendiente (cuando paga)
     */
    public function reducirSaldoPendiente(float $monto): void
    {
        $this->decrement('saldo_pendiente', $monto);
    }

    /**
     * Agregar saldo a favor
     */
    public function agregarSaldoFavor(float $monto): void
    {
        $this->increment('saldo_favor', $monto);
    }

    /**
     * Usar saldo a favor
     */
    public function usarSaldoFavor(float $monto): void
    {
        $montoUsar = min($this->saldo_favor, $monto);
        $this->decrement('saldo_favor', $montoUsar);
    }

    /**
     * Obtener nombre completo para mostrar
     */
    public function getNombreCompletoAttribute(): string
    {
        return $this->nombre_comercial ?: $this->razon_social;
    }
}
