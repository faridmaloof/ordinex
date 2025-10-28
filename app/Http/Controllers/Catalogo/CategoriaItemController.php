<?php

namespace App\Http\Controllers\Catalogo;

use App\Http\Controllers\Controller;
use App\Models\Catalogo\CategoriaItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoriaItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CategoriaItem::withCount('items')->orderBy('nombre');

        if ($request->filled('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }

        $categorias = $query->paginate(15)->withQueryString();

        return Inertia::render('Catalogo/CategoriaItem/Index', [
            'categorias' => $categorias,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categoriasPadre = CategoriaItem::whereNull('padre_id')->orderBy('nombre')->get();

        return Inertia::render('Catalogo/CategoriaItem/Create', [
            'categoriasPadre' => $categoriasPadre,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cat__categorias_items,nombre',
            'descripcion' => 'nullable|string|max:500',
            'padre_id' => 'nullable|exists:cat__categorias_items,id',
        ]);

        DB::transaction(function () use ($validated) {
            $categoria = CategoriaItem::create($validated);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'crear',
                'categoria_item',
                'cat__categorias_items',
                $categoria->id,
                null,
                $categoria->toArray()
            );
        });

        return redirect()
            ->route('catalogo.categorias.index')
            ->with('success', 'Categoría creada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(CategoriaItem $categoria)
    {
        $categoria->load(['padre', 'items']);

        return Inertia::render('Catalogo/CategoriaItem/Show', [
            'categoria' => $categoria,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CategoriaItem $categoria)
    {
        $categoria->load('padre');
        $categoriasPadre = CategoriaItem::whereNull('padre_id')
            ->where('id', '!=', $categoria->id)
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Catalogo/CategoriaItem/Edit', [
            'categoria' => $categoria,
            'categoriasPadre' => $categoriasPadre,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CategoriaItem $categoria)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cat__categorias_items,nombre,' . $categoria->id,
            'descripcion' => 'nullable|string|max:500',
            'padre_id' => 'nullable|exists:cat__categorias_items,id',
        ]);

        // Validar que no se establezca a sí misma como padre
        if (isset($validated['padre_id']) && $validated['padre_id'] == $categoria->id) {
            return back()->with('error', 'Una categoría no puede ser su propio padre');
        }

        DB::transaction(function () use ($categoria, $validated) {
            $datosAnteriores = $categoria->toArray();
            $categoria->update($validated);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'actualizar',
                'categoria_item',
                'cat__categorias_items',
                $categoria->id,
                $datosAnteriores,
                $categoria->fresh()->toArray()
            );
        });

        return redirect()
            ->route('catalogo.categorias.show', $categoria)
            ->with('success', 'Categoría actualizada exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategoriaItem $categoria)
    {
        // Verificar que no tenga items asociados
        if ($categoria->items()->exists()) {
            return back()->with('error', 'No se puede eliminar una categoría que tiene items asociados');
        }

        // Verificar que no tenga subcategorías
        if ($categoria->hijos()->exists()) {
            return back()->with('error', 'No se puede eliminar una categoría que tiene subcategorías');
        }

        DB::transaction(function () use ($categoria) {
            $datosAnteriores = $categoria->toArray();
            $categoria->delete();

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'eliminar',
                'categoria_item',
                'cat__categorias_items',
                $categoria->id,
                $datosAnteriores,
                null
            );
        });

        return redirect()
            ->route('catalogo.categorias.index')
            ->with('success', 'Categoría eliminada exitosamente');
    }
}
