<?php

namespace App\Models\Auditoria;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class Auditoria extends Model
{
    protected $table = 'aud__auditoria';

    protected $fillable = [
        'usuario_id',
        'accion',
        'modulo',
        'tabla',
        'registro_id',
        'datos_anteriores',
        'datos_nuevos',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function scopeModulo($query, string $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    public function scopeAccion($query, string $accion)
    {
        return $query->where('accion', $accion);
    }

    public function scopeUsuario($query, int $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    /**
     * Helper para registrar auditoría
     */
    public static function registrar(
        string $accion, 
        string $modulo, 
        string $tabla, 
        ?int $registro_id = null, 
        ?array $datos_anteriores = null, 
        ?array $datos_nuevos = null
    ): void
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        
        self::create([
            'usuario_id' => $user?->id,
            'accion' => $accion,
            'modulo' => $modulo,
            'tabla' => $tabla,
            'registro_id' => $registro_id,
            'datos_anteriores' => $datos_anteriores,
            'datos_nuevos' => $datos_nuevos,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
