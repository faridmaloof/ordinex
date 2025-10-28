<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Config\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['rol', 'cajaDefecto'])
            ->orderBy('name');

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('documento', 'like', "%{$search}%");
            });
        }

        // Filtro por rol
        if ($request->filled('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }

        // Filtro por estado
        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === '1');
        }

        // Paginación dinámica
        $perPage = $request->get('per_page', 10);
        $usuarios = $query->paginate($perPage)->withQueryString();
        
        // Cargar roles para el filtro
        $roles = Rol::activos()->orderBy('nombre')->get(['id', 'nombre', 'nivel', 'color']);

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'filters' => $request->only(['search', 'rol_id', 'activo']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Rol::activos()->orderBy('nombre')->get(['id', 'nombre', 'nivel', 'color']);
        $cajas = \App\Models\Transaccion\Caja::where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'activo']);

        return Inertia::render('Usuarios/Create', [
            'roles' => $roles,
            'cajas' => $cajas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'documento' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'rol_id' => 'required|exists:cnf__roles,id',
            'caja_defecto_id' => 'nullable|exists:trn__cajas,id',
            'activo' => 'boolean',
            'es_super_admin' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Solo super admin puede crear super admins
            $esSuperAdmin = false;
            if ($request->user()->esSuperAdmin() && ($validated['es_super_admin'] ?? false)) {
                $esSuperAdmin = true;
            }

            $usuario = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'documento' => $validated['documento'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'rol_id' => $validated['rol_id'],
                'caja_defecto_id' => $validated['caja_defecto_id'] ?? null,
                'activo' => $validated['activo'] ?? true,
                'es_super_admin' => $esSuperAdmin,
            ]);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'crear',
                'usuario',
                'users',
                $usuario->id,
                null,
                $usuario->toArray()
            );
        });

        return redirect()
            ->route('config.usuarios.index')
            ->with('success', 'Usuario creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $usuario)
    {
        $usuario->load(['rol.permisos', 'cajaDefecto']);
        
        $permisosCount = $usuario->rol ? $usuario->rol->permisos->count() : 0;

        return Inertia::render('Usuarios/Show', [
            'usuario' => $usuario,
            'permisos_count' => $permisosCount,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $usuario)
    {
        $usuario->load('rol');
        
        $roles = Rol::activos()->orderBy('nombre')->get(['id', 'nombre', 'nivel', 'color']);
        $cajas = \App\Models\Transaccion\Caja::where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'activo']);

        return Inertia::render('Usuarios/Edit', [
            'usuario' => $usuario,
            'roles' => $roles,
            'cajas' => $cajas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $usuario)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $usuario->id,
            'password' => 'nullable|string|min:8|confirmed',
            'documento' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'rol_id' => 'required|exists:cnf__roles,id',
            'caja_defecto_id' => 'nullable|exists:trn__cajas,id',
            'activo' => 'boolean',
            'es_super_admin' => 'boolean',
        ]);

        DB::transaction(function () use ($usuario, $validated, $request) {
            $datosAnteriores = $usuario->toArray();

            // Solo super admin puede modificar el flag es_super_admin
            $esSuperAdmin = $usuario->es_super_admin;
            if ($request->user()->esSuperAdmin()) {
                $esSuperAdmin = $validated['es_super_admin'] ?? false;
            }

            $datos = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'documento' => $validated['documento'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'rol_id' => $validated['rol_id'],
                'caja_defecto_id' => $validated['caja_defecto_id'] ?? null,
                'activo' => $validated['activo'] ?? true,
                'es_super_admin' => $esSuperAdmin,
            ];

            // Solo actualizar contraseña si se proporcionó
            if (!empty($validated['password'])) {
                $datos['password'] = Hash::make($validated['password']);
            }

            $usuario->update($datos);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'actualizar',
                'usuario',
                'users',
                $usuario->id,
                $datosAnteriores,
                $usuario->fresh()->toArray()
            );
        });

        return redirect()
            ->route('config.usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $usuario)
    {
        // No permitir eliminar super admins
        if ($usuario->es_super_admin) {
            return back()->with('error', 'No se pueden eliminar usuarios super administradores');
        }

        // No permitir eliminar usuario autenticado
        /** @var \App\Models\User $currentUser */
        $currentUser = auth()->user();
        if ($usuario->id === $currentUser->id) {
            return back()->with('error', 'No puedes eliminar tu propio usuario');
        }

        DB::transaction(function () use ($usuario) {
            $datosAnteriores = $usuario->toArray();
            $usuario->delete();

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'eliminar',
                'usuario',
                'users',
                $usuario->id,
                $datosAnteriores,
                null
            );
        });

        return redirect()
            ->route('config.usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente');
    }

    /**
     * Toggle usuario activo/inactivo
     */
    public function toggleStatus(User $usuario)
    {
        // No permitir desactivar super admins
        if ($usuario->es_super_admin) {
            return back()->with('error', 'No se pueden desactivar usuarios super administradores');
        }

        // No permitir desactivar usuario autenticado
        /** @var \App\Models\User $currentUser */
        $currentUser = auth()->user();
        if ($usuario->id === $currentUser->id) {
            return back()->with('error', 'No puedes desactivar tu propio usuario');
        }

        DB::transaction(function () use ($usuario) {
            $datosAnteriores = $usuario->toArray();
            $usuario->update(['activo' => !$usuario->activo]);

            // Registrar auditoría
            \App\Models\Auditoria\Auditoria::registrar(
                'cambiar_estado',
                'usuario',
                'users',
                $usuario->id,
                $datosAnteriores,
                $usuario->fresh()->toArray()
            );
        });

        $mensaje = $usuario->activo ? 'Usuario activado' : 'Usuario desactivado';
        return back()->with('success', $mensaje);
    }
}
