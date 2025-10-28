<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Catalogo\Cliente;

class Entrega extends Model
{
    protected $table = 'doc__entregas';

    protected $fillable = [
        'numero',
        'orden_servicio_id',
        'cliente_id',
        'fecha_entrega',
        'quien_recibe',
        'documento_recibe',
        'usuario_entrega_id',
        'observaciones',
        'firma',
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime',
    ];

    public function ordenServicio(): BelongsTo
    {
        return $this->belongsTo(OrdenServicio::class, 'orden_servicio_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function usuarioEntrega(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_entrega_id');
    }

    public static function generarNumero(): string
    {
        $ultimo = static::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->numero, 4)) + 1 : 1;
        return 'ENT-' . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
