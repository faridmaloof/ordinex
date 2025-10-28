<?php

namespace App\Models\Catalogo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaItem extends Model
{
    protected $table = 'cat__categorias_items';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'categoria_padre_id',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Categoría padre (para jerarquía)
     */
    public function categoriaPadre(): BelongsTo
    {
        return $this->belongsTo(CategoriaItem::class, 'categoria_padre_id');
    }

    /**
     * Subcategorías
     */
    public function subcategorias(): HasMany
    {
        return $this->hasMany(CategoriaItem::class, 'categoria_padre_id');
    }

    /**
     * Items de esta categoría
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'categoria_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Categorías activas
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: Categorías raíz (sin padre)
     */
    public function scopeRaiz($query)
    {
        return $query->whereNull('categoria_padre_id');
    }

    /**
     * Scope: Categorías hijas de una específica
     */
    public function scopeHijasDe($query, int $categoriaId)
    {
        return $query->where('categoria_padre_id', $categoriaId);
    }

    /**
     * Scope: Por nivel
     */
    public function scopeNivel($query, int $nivel)
    {
        return $query->where('nivel', $nivel);
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Verificar si es categoría raíz
     */
    public function esRaiz(): bool
    {
        return is_null($this->categoria_padre_id);
    }

    /**
     * Verificar si tiene subcategorías
     */
    public function tieneSubcategorias(): bool
    {
        return $this->subcategorias()->count() > 0;
    }

    /**
     * Obtener ruta completa de la categoría
     */
    public function getRutaCompleta(): string
    {
        $ruta = [$this->nombre];
        $categoria = $this;

        while ($categoria->categoriaPadre) {
            $categoria = $categoria->categoriaPadre;
            array_unshift($ruta, $categoria->nombre);
        }

        return implode(' > ', $ruta);
    }

    /**
     * Obtener todas las categorías descendientes (recursivo)
     */
    public function getDescendientes(): array
    {
        $descendientes = [];

        foreach ($this->subcategorias as $subcategoria) {
            $descendientes[] = $subcategoria->id;
            $descendientes = array_merge($descendientes, $subcategoria->getDescendientes());
        }

        return $descendientes;
    }
}
