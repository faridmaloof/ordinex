<?php

namespace App\Models\Transaccion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class DiferenciaCaja extends Model
{
    protected $table = 'trx__diferencias_caja';

    protected $fillable = [
        'caja_transaccion_id',
        'monto_diferencia',
        'tipo_diferencia',
        'supervisor_id',
        'clave_diaria',
        'fecha_autorizacion',
        'justificacion',
    ];

    protected $casts = [
        'monto_diferencia' => 'decimal:2',
        'fecha_autorizacion' => 'datetime',
    ];

    public function cajaTransaccion(): BelongsTo
    {
        return $this->belongsTo(CajaTransaccion::class, 'caja_transaccion_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function esSobrante(): bool
    {
        return $this->tipo_diferencia === 'sobrante';
    }

    public function esFaltante(): bool
    {
        return $this->tipo_diferencia === 'faltante';
    }
}
