<?php

namespace App\Models\Auditoria;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ModificacionAutorizada extends Model
{
    protected $table = 'aud__modificaciones_autorizadas';

    protected $fillable = [
        'tabla',
        'registro_id',
        'campo_modificado',
        'valor_anterior',
        'valor_nuevo',
        'usuario_modifica_id',
        'usuario_autoriza_id',
        'clave_diaria',
        'justificacion',
        'fecha_modificacion',
    ];

    protected $casts = [
        'valor_anterior' => 'string',
        'valor_nuevo' => 'string',
        'fecha_modificacion' => 'datetime',
    ];

    public function usuarioModifica(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_modifica_id');
    }

    public function usuarioAutoriza(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_autoriza_id');
    }

    public function scopeTabla($query, string $tabla)
    {
        return $query->where('tabla', $tabla);
    }

    public function scopeRegistro($query, int $registroId)
    {
        return $query->where('registro_id', $registroId);
    }

    public static function registrarModificacion(
        string $tabla,
        int $registroId,
        string $campo,
        $valorAnterior,
        $valorNuevo,
        int $usuarioAutorizaId,
        string $claveDiaria,
        string $justificacion
    ): self {
        /** @var \App\Models\User|null $user */
        $user = auth()->user();
        
        return self::create([
            'tabla' => $tabla,
            'registro_id' => $registroId,
            'campo_modificado' => $campo,
            'valor_anterior' => (string) $valorAnterior,
            'valor_nuevo' => (string) $valorNuevo,
            'usuario_modifica_id' => $user?->id,
            'usuario_autoriza_id' => $usuarioAutorizaId,
            'clave_diaria' => $claveDiaria,
            'justificacion' => $justificacion,
            'fecha_modificacion' => now(),
        ]);
    }
}
