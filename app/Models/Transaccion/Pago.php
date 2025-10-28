<?php

namespace App\Models\Transaccion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Catalogo\Cliente;
use App\Models\Catalogo\FormaPago;
use App\Models\Documento\OrdenServicio;

class Pago extends Model
{
    protected $table = 'trx__pagos';

    protected $fillable = [
        'numero',
        'cliente_id',
        'orden_servicio_id',
        'forma_pago_id',
        'fecha',
        'monto',
        'tipo_pago',
        'referencia',
        'usa_saldo_favor',
        'monto_saldo_favor',
        'caja_transaccion_id',
        'usuario_id',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'monto' => 'decimal:2',
        'usa_saldo_favor' => 'boolean',
        'monto_saldo_favor' => 'decimal:2',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function ordenServicio(): BelongsTo
    {
        return $this->belongsTo(OrdenServicio::class, 'orden_servicio_id');
    }

    public function formaPago(): BelongsTo
    {
        return $this->belongsTo(FormaPago::class, 'forma_pago_id');
    }

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
        return $query->where('tipo_pago', $tipo);
    }

    public function esAnticipo(): bool
    {
        return $this->tipo_pago === 'anticipo';
    }

    public function esPagoFinal(): bool
    {
        return $this->tipo_pago === 'pago_final';
    }

    public function getMontoTotal(): float
    {
        return $this->monto + $this->monto_saldo_favor;
    }

    public static function generarNumero(): string
    {
        $ultimo = static::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->numero, 4)) + 1 : 1;
        return 'PAG-' . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
