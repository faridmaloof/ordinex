<?php

namespace App\Models\Documento;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class OrdenServicioHistorial extends Model
{
    protected $table = 'doc__ordenes_servicio_historial';

    protected $fillable = [
        'orden_servicio_id',
        'estado_anterior',
        'estado_nuevo',
        'usuario_id',
        'observaciones',
    ];

    public function ordenServicio(): BelongsTo
    {
        return $this->belongsTo(OrdenServicio::class, 'orden_servicio_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
