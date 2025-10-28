<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\User;
use App\Models\Catalogo\Cliente;

class OrdenServicio extends Model
{
    protected $table = 'doc__ordenes_servicio';

    protected $fillable = [
        'numero',
        'solicitud_id',
        'cliente_id',
        'fecha',
        'fecha_inicio',
        'fecha_fin_estimada',
        'fecha_fin_real',
        'estado',
        'prioridad',
        'tecnico_asignado_id',
        'usuario_crea_id',
        'subtotal',
        'descuento',
        'iva',
        'total',
        'observaciones',
        'bloqueada_en',
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_inicio' => 'datetime',
        'fecha_fin_estimada' => 'datetime',
        'fecha_fin_real' => 'datetime',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
        'bloqueada_en' => 'datetime',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Solicitud origen
     */
    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(Solicitud::class, 'solicitud_id');
    }

    /**
     * Cliente
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    /**
     * Técnico asignado
     */
    public function tecnicoAsignado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_asignado_id');
    }

    /**
     * Usuario que creó
     */
    public function usuarioCrea(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_crea_id');
    }

    /**
     * Items de la orden
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrdenServicioItem::class, 'orden_servicio_id');
    }

    /**
     * Historial de cambios de estado
     */
    public function historial(): HasMany
    {
        return $this->hasMany(OrdenServicioHistorial::class, 'orden_servicio_id');
    }

    /**
     * Entrega asociada
     */
    public function entrega(): HasOne
    {
        return $this->hasOne(Entrega::class, 'orden_servicio_id');
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
     * Scope: En proceso
     */
    public function scopeEnProceso($query)
    {
        return $query->where('estado', 'en_proceso');
    }

    /**
     * Scope: Por técnico
     */
    public function scopeTecnico($query, int $tecnicoId)
    {
        return $query->where('tecnico_asignado_id', $tecnicoId);
    }

    /**
     * Scope: Por prioridad
     */
    public function scopePrioridad($query, string $prioridad)
    {
        return $query->where('prioridad', $prioridad);
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
     * Cambiar estado y registrar en historial
     */
    public function cambiarEstado(string $nuevoEstado, int $usuarioId, ?string $observaciones = null): void
    {
        $estadoAnterior = $this->estado;

        $this->update(['estado' => $nuevoEstado]);

        // Registrar en historial
        $this->historial()->create([
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $nuevoEstado,
            'usuario_id' => $usuarioId,
            'observaciones' => $observaciones,
        ]);
    }

    /**
     * Iniciar orden
     */
    public function iniciar(int $usuarioId): void
    {
        $this->update([
            'estado' => 'en_proceso',
            'fecha_inicio' => now(),
        ]);

        $this->cambiarEstado('en_proceso', $usuarioId, 'Orden iniciada');
    }

    /**
     * Completar orden
     */
    public function completar(int $usuarioId): void
    {
        $this->update([
            'estado' => 'completada',
            'fecha_fin_real' => now(),
            'bloqueada_en' => now(),
        ]);

        $this->cambiarEstado('completada', $usuarioId, 'Orden completada');
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
        $numero = $ultimo ? intval(substr($ultimo->numero, 3)) + 1 : 1;
        return 'OS-' . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
