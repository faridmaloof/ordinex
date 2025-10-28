<?php

namespace App\Models\Config;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Caja extends Model
{
    protected $table = 'cnf__cajas';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'ubicacion',
        'responsable_id',
        'monto_base',
        'requiere_autorizacion_cierre',
        'activa',
    ];

    protected $casts = [
        'monto_base' => 'decimal:2',
        'requiere_autorizacion_cierre' => 'boolean',
        'activa' => 'boolean',
    ];

    /**
     * Relación con responsable
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    /**
     * Relación con usuarios que tienen esta caja como defecto
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'caja_defecto_id');
    }

    /**
     * Scope para cajas activas
     */
    public function scopeActiva($query)
    {
        return $query->where('activa', true);
    }
}
