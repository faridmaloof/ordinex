<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Config\Rol;
use App\Models\Config\Caja;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol_id',
        'caja_defecto_id',
        'es_super_admin',
        'activo',
        'telefono',
        'documento',
        'ultima_conexion',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'es_super_admin' => 'boolean',
            'activo' => 'boolean',
            'ultima_conexion' => 'datetime',
        ];
    }

    /**
     * Relación con rol
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Relación con caja por defecto
     */
    public function cajaDefecto(): BelongsTo
    {
        return $this->belongsTo(Caja::class, 'caja_defecto_id');
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para excluir super admins
     */
    public function scopeSinSuperAdmin($query)
    {
        return $query->where('es_super_admin', false);
    }

    /**
     * Verificar si es super admin
     */
    public function esSuperAdmin(): bool
    {
        return $this->es_super_admin === true;
    }

    /**
     * Verificar si tiene un permiso específico
     */
    public function tienePermiso(string $codigoPermiso): bool
    {
        if ($this->esSuperAdmin()) {
            return true;
        }

        return $this->rol?->tienePermiso($codigoPermiso) ?? false;
    }

    /**
     * Verificar si tiene mayor jerarquía que otro usuario
     */
    public function esMayorQue(User $otroUsuario): bool
    {
        if ($this->esSuperAdmin()) {
            return true;
        }

        if ($otroUsuario->esSuperAdmin()) {
            return false;
        }

        return $this->rol?->esMayorQue($otroUsuario->rol) ?? false;
    }

    /**
     * Actualizar última conexión
     */
    public function actualizarUltimaConexion(): void
    {
        $this->update(['ultima_conexion' => now()]);
    }
}
