<?php

namespace App\Models\Config;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Rol extends Model
{
    protected $table = 'cnf__roles';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'nivel_jerarquico',
        'puede_modificar_autorizados',
        'requiere_clave_diaria',
        'puede_cerrar_caja_con_diferencia',
        'es_super_admin',
        'es_sistema',
        'activo',
    ];

    protected $casts = [
        'nivel_jerarquico' => 'integer',
        'puede_modificar_autorizados' => 'boolean',
        'requiere_clave_diaria' => 'boolean',
        'puede_cerrar_caja_con_diferencia' => 'boolean',
        'es_super_admin' => 'boolean',
        'es_sistema' => 'boolean',
        'activo' => 'boolean',
    ];

    /**
     * Relación con permisos
     */
    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(
            Permiso::class,
            'cnf__roles_permisos',
            'rol_id',
            'permiso_id'
        );
    }

    /**
     * Relación con usuarios
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'rol_id');
    }

    /**
     * Scope para roles activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para excluir super admin del listado
     */
    public function scopeSinSuperAdmin($query)
    {
        return $query->where('es_super_admin', false);
    }

    /**
     * Verificar si el rol tiene un permiso específico
     */
    public function tienePermiso(string $codigoPermiso): bool
    {
        return $this->permisos()->where('codigo', $codigoPermiso)->exists();
    }

    /**
     * Verificar si tiene mayor jerarquía que otro rol
     */
    public function esMayorQue(Rol $otroRol): bool
    {
        return $this->nivel_jerarquico < $otroRol->nivel_jerarquico;
    }
}
