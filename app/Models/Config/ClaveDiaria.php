<?php

namespace App\Models\Config;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use Illuminate\Support\Str;

class ClaveDiaria extends Model
{
    protected $table = 'cnf__claves_diarias';

    protected $fillable = [
        'fecha',
        'clave',
        'usuario_genera_id',
        'activa',
        'fecha_generacion',
    ];

    protected $casts = [
        'fecha' => 'date',
        'activa' => 'boolean',
        'fecha_generacion' => 'datetime',
    ];

    /**
     * Relación con usuario que genera
     */
    public function usuarioGenera(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_genera_id');
    }

    /**
     * Generar clave diaria automáticamente
     */
    public static function generarParaHoy(?int $usuarioId = null): self
    {
        $fecha = now()->toDateString();
        
        // Desactivar cualquier clave existente para hoy
        static::where('fecha', $fecha)->update(['activa' => false]);
        
        // Crear nueva clave
        return static::create([
            'fecha' => $fecha,
            'clave' => static::generarClave(),
            'usuario_genera_id' => $usuarioId,
            'activa' => true,
            'fecha_generacion' => now(),
        ]);
    }

    /**
     * Generar código alfanumérico
     */
    protected static function generarClave(): string
    {
        return strtoupper(Str::random(6));
    }

    /**
     * Validar clave para una fecha
     */
    public static function validar(string $clave, ?string $fecha = null): bool
    {
        $fecha = $fecha ?? now()->toDateString();
        
        return static::where('fecha', $fecha)
            ->where('clave', strtoupper($clave))
            ->where('activa', true)
            ->exists();
    }

    /**
     * Obtener clave activa del día
     */
    public static function getClaveHoy(): ?self
    {
        return static::where('fecha', now()->toDateString())
            ->where('activa', true)
            ->first();
    }
}
