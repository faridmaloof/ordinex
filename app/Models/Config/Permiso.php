<?php

namespace App\Models\Config;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permiso extends Model
{
    protected $table = 'cnf__permisos';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'modulo',
        'accion',
        'es_sistema',
    ];

    protected $casts = [
        'es_sistema' => 'boolean',
    ];

    /**
     * Relación con roles
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Rol::class,
            'cnf__roles_permisos',
            'permiso_id',
            'rol_id'
        );
    }

    /**
     * Scope por módulo
     */
    public function scopeModulo($query, string $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    /**
     * Scope por acción
     */
    public function scopeAccion($query, string $accion)
    {
        return $query->where('accion', $accion);
    }
}
