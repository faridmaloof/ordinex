<?php

namespace App\Models\Transaccion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Config\Caja;

class CajaTransaccion extends Model
{
    protected $table = 'trx__cajas';

    protected $fillable = [
        'caja_id',
        'usuario_id',
        'fecha_apertura',
        'fecha_cierre',
        'monto_inicial',
        'monto_ventas',
        'monto_gastos',
        'monto_final_esperado',
        'monto_final_real',
        'diferencia',
        'estado',
        'observaciones_apertura',
        'observaciones_cierre',
    ];

    protected $casts = [
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
        'monto_inicial' => 'decimal:2',
        'monto_ventas' => 'decimal:2',
        'monto_gastos' => 'decimal:2',
        'monto_final_esperado' => 'decimal:2',
        'monto_final_real' => 'decimal:2',
        'diferencia' => 'decimal:2',
    ];

    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class, 'caja_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoCaja::class, 'caja_transaccion_id');
    }

    public function diferencias(): HasMany
    {
        return $this->hasMany(DiferenciaCaja::class, 'caja_transaccion_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'caja_transaccion_id');
    }

    public function scopeAbierta($query)
    {
        return $query->where('estado', 'abierta');
    }

    public function scopeCerrada($query)
    {
        return $query->where('estado', 'cerrada');
    }

    public function estaAbierta(): bool
    {
        return $this->estado === 'abierta';
    }

    public function tieneDiferencia(): bool
    {
        return abs($this->diferencia) > 0.01;
    }
}
