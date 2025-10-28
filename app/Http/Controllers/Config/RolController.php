<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;
use App\Models\Config\Rol;
use App\Models\Config\Permiso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Rol::withCount('usuarios')->orderBy('nivel_jerarquico');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === 'true');
        }

        $roles = $query->paginate(15)->withQueryString();

        return Inertia::render('Config/Rol/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'activo']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permisos = Permiso::orderBy('modulo')->orderBy('nombre')->get()->groupBy('modulo');

        return Inertia::render('Config/Rol/Create', [
            'permisos' => $permisos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cnf__roles,nombre',
            'descripcion' => 'nullable|string|max:500',
            'nivel_jerarquico' => 'required|integer|min:1|unique:cnf__roles,nivel_jerarquico',
            'color' => 'nullable|string|max:20',
            'activo' => 'boolean',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:cnf__permisos,id',
        ]);

        DB::transaction(function () use ($validated) {
            $rol = Rol::create([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'nivel_jerarquico' => $validated['nivel_jerarquico'],
                'color' => $validated['color'] ?? null,
                'activo' => $validated['activo'] ?? true,
                'es_sistema' => false,
            ]);

            // Asignar permisos
            if (!empty($validated['permisos'])) {
                $rol->permisos()->attach($validated['permisos']);
            }

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'crear',
                'rol',
                'cnf__roles',
                $rol->id,
                null,
                array_merge($rol->toArray(), ['permisos' => $validated['permisos'] ?? []])
            );
        });

        return redirect()
            ->route('configuracion.roles.index')
            ->with('success', 'Rol creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Rol $rol)
    {
        $rol->load(['permisos' => function ($q) {
            $q->orderBy('modulo')->orderBy('nombre');
        }, 'usuarios']);

        return Inertia::render('Config/Rol/Show', [
            'rol' => $rol,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rol $rol)
    {
        // No permitir editar roles de sistema
        if ($rol->es_sistema) {
            return back()->with('error', 'No se pueden editar roles de sistema');
        }

        $rol->load('permisos');
        $permisos = Permiso::orderBy('modulo')->orderBy('nombre')->get()->groupBy('modulo');

        return Inertia::render('Config/Rol/Edit', [
            'rol' => $rol,
            'permisos' => $permisos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rol $rol)
    {
        // No permitir editar roles de sistema
        if ($rol->es_sistema) {
            return back()->with('error', 'No se pueden editar roles de sistema');
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cnf__roles,nombre,' . $rol->id,
            'descripcion' => 'nullable|string|max:500',
            'nivel_jerarquico' => 'required|integer|min:1|unique:cnf__roles,nivel_jerarquico,' . $rol->id,
            'color' => 'nullable|string|max:20',
            'activo' => 'boolean',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:cnf__permisos,id',
        ]);

        DB::transaction(function () use ($rol, $validated) {
            $datosAnteriores = $rol->toArray();
            $datosAnteriores['permisos'] = $rol->permisos->pluck('id')->toArray();

            $rol->update([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'nivel_jerarquico' => $validated['nivel_jerarquico'],
                'color' => $validated['color'] ?? null,
                'activo' => $validated['activo'] ?? true,
            ]);

            // Sincronizar permisos
            $rol->permisos()->sync($validated['permisos'] ?? []);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'actualizar',
                'rol',
                'cnf__roles',
                $rol->id,
                $datosAnteriores,
                array_merge($rol->fresh()->toArray(), ['permisos' => $validated['permisos'] ?? []])
            );
        });

        return redirect()
            ->route('configuracion.roles.show', $rol)
            ->with('success', 'Rol actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rol $rol)
    {
        // No permitir eliminar roles de sistema
        if ($rol->es_sistema) {
            return back()->with('error', 'No se pueden eliminar roles de sistema');
        }

        // Verificar que no tenga usuarios asignados
        if ($rol->usuarios()->exists()) {
            return back()->with('error', 'No se puede eliminar un rol que tiene usuarios asignados');
        }

        DB::transaction(function () use ($rol) {
            $datosAnteriores = $rol->toArray();
            $datosAnteriores['permisos'] = $rol->permisos->pluck('id')->toArray();

            // Eliminar relaciones
            $rol->permisos()->detach();
            $rol->delete();

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'eliminar',
                'rol',
                'cnf__roles',
                $rol->id,
                $datosAnteriores,
                null
            );
        });

        return redirect()
            ->route('configuracion.roles.index')
            ->with('success', 'Rol eliminado exitosamente');
    }
}
