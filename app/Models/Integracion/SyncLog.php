<?php

namespace App\Models\Integracion;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'aud_sync_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tipo',
        'fecha_sync',
        'registros_nuevos',
        'registros_actualizados',
        'errores',
        'detalle_errores',
        'usuario_ejecuta_id',
        'tipo_ejecucion',
    ];

    /**
     * Get the user who executed the sync.
     */
    public function usuario()
    {
        return $this->belongsTo(\App\Models\User::class, 'usuario_ejecuta_id');
    }
}