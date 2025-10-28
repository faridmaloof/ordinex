<?php

namespace App\Models\Catalogo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $table = 'cat__clientes';

    protected $fillable = [
        'erp_id',
        'tipo_cliente',
        'tipo_documento',
        'numero_documento',
        'nombre',
        'telefono',
        'celular',
        'email',
        'direccion',
        'ciudad',
        'departamento',
        'vendedor_id',
        'saldo_favor',
        'limite_credito',
        'observaciones',
        'sincronizado_erp',
        'activo',
    ];

    protected $casts = [
        'limite_credito' => 'decimal:2',
        'saldo_favor' => 'decimal:2',
        'sincronizado_erp' => 'boolean',
        'activo' => 'boolean',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Vendedor asignado
     */
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'vendedor_id');
    }

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
        return $query->where('limite_credito', '>', 0)
                     ->whereRaw('limite_credito > 0');
    }

    /**
     * Scope: Buscar por término
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('numero_documento', 'like', "%{$termino}%")
              ->orWhere('nombre', 'like', "%{$termino}%")
              ->orWhere('email', 'like', "%{$termino}%");
        });
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

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
     * Obtener nombre para mostrar
     */
    public function getNombreDisplayAttribute(): string
    {
        return $this->nombre;
    }

    /**
     * Verificar si es cliente jurídico
     */
    public function esJuridico(): bool
    {
        return $this->tipo_cliente === 'juridico';
    }

    /**
     * Verificar si está sincronizado con ERP
     */
    public function estaSincronizado(): bool
    {
        return $this->sincronizado_erp && !empty($this->erp_id);
    }
}
