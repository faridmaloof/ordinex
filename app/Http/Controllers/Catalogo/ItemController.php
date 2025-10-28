<?php

namespace App\Http\Controllers\Catalogo;

use App\Http\Controllers\Controller;
use App\Models\Catalogo\Item;
use App\Models\Catalogo\CategoriaItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Item::with('categoria')->orderBy('nombre');

        // Filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === 'true');
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('stock_bajo')) {
            $query->whereRaw('stock_actual < stock_minimo');
        }

        $items = $query->paginate(15)->withQueryString();
        $categorias = CategoriaItem::orderBy('nombre')->get();

        return Inertia::render('Catalogo/Item/Index', [
            'items' => $items,
            'categorias' => $categorias,
            'filters' => $request->only(['search', 'categoria_id', 'activo', 'tipo', 'stock_bajo']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categorias = CategoriaItem::orderBy('nombre')->get();

        return Inertia::render('Catalogo/Item/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:cat__items,codigo',
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string|max:1000',
            'categoria_id' => 'required|exists:cat__categorias_items,id',
            'tipo' => 'required|in:producto,servicio,insumo',
            'unidad_medida' => 'required|string|max:20',
            'precio_venta' => 'required|numeric|min:0',
            'precio_costo' => 'nullable|numeric|min:0',
            'aplica_iva' => 'boolean',
            'porcentaje_iva' => 'nullable|numeric|min:0|max:100',
            'maneja_inventario' => 'boolean',
            'stock_inicial' => 'nullable|numeric|min:0',
            'stock_minimo' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $item = Item::create([
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'categoria_id' => $validated['categoria_id'],
                'tipo' => $validated['tipo'],
                'unidad_medida' => $validated['unidad_medida'],
                'precio_venta' => $validated['precio_venta'],
                'precio_costo' => $validated['precio_costo'] ?? 0,
                'aplica_iva' => $validated['aplica_iva'] ?? false,
                'porcentaje_iva' => $validated['porcentaje_iva'] ?? 0,
                'maneja_inventario' => $validated['maneja_inventario'] ?? false,
                'stock_inicial' => $validated['stock_inicial'] ?? 0,
                'stock_actual' => $validated['stock_inicial'] ?? 0,
                'stock_minimo' => $validated['stock_minimo'] ?? 0,
                'activo' => $validated['activo'] ?? true,
            ]);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'crear',
                'item',
                'cat__items',
                $item->id,
                null,
                $item->toArray()
            );
        });

        return redirect()
            ->route('catalogo.items.index')
            ->with('success', 'Item creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        $item->load('categoria');

        return Inertia::render('Catalogo/Item/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Item $item)
    {
        $item->load('categoria');
        $categorias = CategoriaItem::orderBy('nombre')->get();

        return Inertia::render('Catalogo/Item/Edit', [
            'item' => $item,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:cat__items,codigo,' . $item->id,
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string|max:1000',
            'categoria_id' => 'required|exists:cat__categorias_items,id',
            'tipo' => 'required|in:producto,servicio,insumo',
            'unidad_medida' => 'required|string|max:20',
            'precio_venta' => 'required|numeric|min:0',
            'precio_costo' => 'nullable|numeric|min:0',
            'aplica_iva' => 'boolean',
            'porcentaje_iva' => 'nullable|numeric|min:0|max:100',
            'maneja_inventario' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);

        DB::transaction(function () use ($item, $validated) {
            $datosAnteriores = $item->toArray();

            $item->update([
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'categoria_id' => $validated['categoria_id'],
                'tipo' => $validated['tipo'],
                'unidad_medida' => $validated['unidad_medida'],
                'precio_venta' => $validated['precio_venta'],
                'precio_costo' => $validated['precio_costo'] ?? 0,
                'aplica_iva' => $validated['aplica_iva'] ?? false,
                'porcentaje_iva' => $validated['porcentaje_iva'] ?? 0,
                'maneja_inventario' => $validated['maneja_inventario'] ?? false,
                'stock_minimo' => $validated['stock_minimo'] ?? 0,
                'activo' => $validated['activo'] ?? true,
            ]);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'actualizar',
                'item',
                'cat__items',
                $item->id,
                $datosAnteriores,
                $item->fresh()->toArray()
            );
        });

        return redirect()
            ->route('catalogo.items.show', $item)
            ->with('success', 'Item actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        // Verificar que no esté siendo usado en solicitudes o órdenes
        if ($item->solicitudItems()->exists() || $item->ordenItems()->exists()) {
            return back()->with('error', 'No se puede eliminar un item que está siendo usado en documentos');
        }

        DB::transaction(function () use ($item) {
            $datosAnteriores = $item->toArray();
            $item->delete();

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'eliminar',
                'item',
                'cat__items',
                $item->id,
                $datosAnteriores,
                null
            );
        });

        return redirect()
            ->route('catalogo.items.index')
            ->with('success', 'Item eliminado exitosamente');
    }

    /**
     * Ajustar stock del item (entrada o salida)
     */
    public function ajustarStock(Request $request, Item $item)
    {
        $validated = $request->validate([
            'tipo_movimiento' => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:500',
        ]);

        if (!$item->maneja_inventario) {
            return back()->with('error', 'Este item no maneja inventario');
        }

        try {
            DB::transaction(function () use ($item, $validated) {
                $stockAnterior = $item->stock_actual;

                // Calcular nuevo stock
                $nuevoStock = match ($validated['tipo_movimiento']) {
                    'entrada' => $stockAnterior + $validated['cantidad'],
                    'salida' => $stockAnterior - $validated['cantidad'],
                    'ajuste' => $validated['cantidad'],
                };

                if ($nuevoStock < 0) {
                    throw new \Exception('El stock no puede ser negativo');
                }

                $item->update(['stock_actual' => $nuevoStock]);

                // Registrar auditoría
                \App\Models\Auditoria\Auditoria::registrar(
                    'ajustar_stock',
                    'item',
                    'cat__items',
                    $item->id,
                    ['stock_actual' => $stockAnterior],
                    [
                        'stock_actual' => $nuevoStock,
                        'tipo_movimiento' => $validated['tipo_movimiento'],
                        'cantidad' => $validated['cantidad'],
                        'motivo' => $validated['motivo'],
                    ]
                );
            });

            return back()->with('success', 'Stock ajustado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
