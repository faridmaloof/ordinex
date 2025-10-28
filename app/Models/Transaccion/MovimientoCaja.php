<?php

namespace App\Models\Transaccion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class MovimientoCaja extends Model
{
    protected $table = 'trx__movimientos_caja';

    protected $fillable = [
        'caja_transaccion_id',
        'tipo',
        'monto',
        'concepto',
        'referencia',
        'usuario_id',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function cajaTransaccion(): BelongsTo
    {
        return $this->belongsTo(CajaTransaccion::class, 'caja_transaccion_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function scopeTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function esIngreso(): bool
    {
        return $this->tipo === 'ingreso';
    }

    public function esEgreso(): bool
    {
        return $this->tipo === 'egreso';
    }
}
