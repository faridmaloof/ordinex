<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\User;
use App\Models\Catalogo\Cliente;

class Solicitud extends Model
{
    protected $table = 'doc__solicitudes';

    protected $fillable = [
        'numero',
        'cliente_id',
        'fecha',
        'fecha_entrega_estimada',
        'estado',
        'usuario_crea_id',
        'usuario_autoriza_id',
        'fecha_autorizacion',
        'subtotal',
        'descuento',
        'iva',
        'total',
        'observaciones',
        'requiere_autorizacion',
        'bloqueada_en',
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_entrega_estimada' => 'date',
        'fecha_autorizacion' => 'datetime',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
        'requiere_autorizacion' => 'boolean',
        'bloqueada_en' => 'datetime',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Cliente de la solicitud
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    /**
     * Usuario que creó la solicitud
     */
    public function usuarioCrea(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_crea_id');
    }

    /**
     * Usuario que autorizó la solicitud
     */
    public function usuarioAutoriza(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_autoriza_id');
    }

    /**
     * Items de la solicitud
     */
    public function items(): HasMany
    {
        return $this->hasMany(SolicitudItem::class, 'solicitud_id');
    }

    /**
     * Orden de servicio generada
     */
    public function ordenServicio(): HasOne
    {
        return $this->hasOne(OrdenServicio::class, 'solicitud_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Por estado
     */
    public function scopeEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope: Pendientes de autorización
     */
    public function scopePendientesAutorizacion($query)
    {
        return $query->where('estado', 'pendiente')
                     ->where('requiere_autorizacion', true);
    }

    /**
     * Scope: Autorizadas
     */
    public function scopeAutorizadas($query)
    {
        return $query->where('estado', 'autorizada');
    }

    /**
     * Scope: Por cliente
     */
    public function scopeCliente($query, int $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    /**
     * Scope: Por rango de fechas
     */
    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Verificar si está bloqueada
     */
    public function estaBloqueada(): bool
    {
        return !is_null($this->bloqueada_en);
    }

    /**
     * Verificar si puede ser modificada
     */
    public function puedeSerModificada(): bool
    {
        return !$this->estaBloqueada() && in_array($this->estado, ['borrador', 'pendiente']);
    }

    /**
     * Verificar si puede ser autorizada
     */
    public function puedeSerAutorizada(): bool
    {
        return $this->estado === 'pendiente' && !$this->estaBloqueada();
    }

    /**
     * Autorizar solicitud
     */
    public function autorizar(int $usuarioId): void
    {
        $this->update([
            'estado' => 'autorizada',
            'usuario_autoriza_id' => $usuarioId,
            'fecha_autorizacion' => now(),
            'bloqueada_en' => now(),
        ]);
    }

    /**
     * Calcular totales
     */
    public function calcularTotales(): void
    {
        $subtotal = $this->items->sum(function ($item) {
            return $item->cantidad * $item->precio_unitario;
        });

        $descuento = $this->items->sum('descuento');
        $iva = ($subtotal - $descuento) * 0.19;
        $total = $subtotal - $descuento + $iva;

        $this->update([
            'subtotal' => $subtotal,
            'descuento' => $descuento,
            'iva' => $iva,
            'total' => $total,
        ]);
    }

    /**
     * Generar número automático
     */
    public static function generarNumero(): string
    {
        $ultimo = static::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->numero, 4)) + 1 : 1;
        return 'SOL-' . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
