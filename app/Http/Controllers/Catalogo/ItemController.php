<?php

namespace App\Http\Controllers\Catalogo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalogo\AjustarStockRequest;
use App\Http\Requests\Catalogo\StoreItemRequest;
use App\Http\Requests\Catalogo\UpdateItemRequest;
use App\Models\Catalogo\CategoriaItem;
use App\Models\Catalogo\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::with('categoria')->orderBy('nombre');

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

    public function create()
    {
        $categorias = CategoriaItem::orderBy('nombre')->get();
        return Inertia::render('Catalogo/Item/Create', [
            'categorias' => $categorias,
        ]);
    }

    public function store(StoreItemRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $item = Item::create([
                'erp_id' => $validated['erp_id'] ?? null,
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'tipo' => $validated['tipo'],
                'categoria_id' => $validated['categoria_id'],
                'categoria_erp' => $validated['categoria_erp'] ?? null,
                'precio_base' => $validated['precio_base'],
                'precio_venta' => $validated['precio_venta'],
                'costo' => $validated['costo'] ?? 0,
                'unidad_medida' => $validated['unidad_medida'] ?? 'unidad',
                'iva' => $validated['iva'] ?? 19.00,
                'tiempo_estimado_servicio' => $validated['tiempo_estimado_servicio'] ?? null,
                'imagen' => $validated['imagen'] ?? null,
                'activo' => $validated['activo'] ?? true,
                'permite_edicion' => $validated['permite_edicion'] ?? true,
                'maneja_inventario' => $validated['maneja_inventario'] ?? false,
                'stock_actual' => $validated['stock_inicial'] ?? 0,
                'stock_minimo' => $validated['stock_minimo'] ?? 0,
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

        return redirect()->route('catalogos.items.index')->with('success', 'Item creado exitosamente');
    }

    public function show(Item $item)
    {
        $item->load('categoria');
        return Inertia::render('Catalogo/Item/Show', [
            'item' => $item,
        ]);
    }

    public function edit(Item $item)
    {
        $item->load('categoria');
        $categorias = CategoriaItem::orderBy('nombre')->get();
        return Inertia::render('Catalogo/Item/Edit', [
            'item' => $item,
            'categorias' => $categorias,
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($item, $validated) {
            $datosAnteriores = $item->toArray();

            $item->update([
                'erp_id' => $validated['erp_id'] ?? null,
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'tipo' => $validated['tipo'],
                'categoria_id' => $validated['categoria_id'],
                'categoria_erp' => $validated['categoria_erp'] ?? null,
                'precio_base' => $validated['precio_base'],
                'precio_venta' => $validated['precio_venta'],
                'costo' => $validated['costo'] ?? 0,
                'unidad_medida' => $validated['unidad_medida'] ?? 'unidad',
                'iva' => $validated['iva'] ?? 19.00,
                'tiempo_estimado_servicio' => $validated['tiempo_estimado_servicio'] ?? null,
                'imagen' => $validated['imagen'] ?? null,
                'activo' => $validated['activo'] ?? true,
                'permite_edicion' => $validated['permite_edicion'] ?? true,
                'maneja_inventario' => $validated['maneja_inventario'] ?? false,
                'stock_minimo' => $validated['stock_minimo'] ?? 0,
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

        return redirect()->route('items.show', $item)->with('success', 'Item actualizado exitosamente');
    }

    public function destroy(Item $item)
    {
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

        return redirect()->route('items.index')->with('success', 'Item eliminado exitosamente');
    }

    public function ajustarStock(AjustarStockRequest $request, Item $item)
    {
        if (!$item->maneja_inventario) {
            return back()->with('error', 'Este item no maneja inventario');
        }

        $validated = $request->validated();

        try {
            DB::transaction(function () use ($item, $validated) {
                $stockAnterior = $item->stock_actual;

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