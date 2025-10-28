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
        $query = User::with('rol')->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->activo === 'true');
        }

        $usuarios = $query->paginate(15)->withQueryString();
        $roles = Rol::activos()->orderBy('nombre')->get();

        return Inertia::render('Config/Usuario/Index', [
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
        $roles = Rol::activos()->orderBy('nombre')->get();

        return Inertia::render('Config/Usuario/Create', [
            'roles' => $roles,
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
            'rol_id' => 'required|exists:cnf__roles,id',
            'activo' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $usuario = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'rol_id' => $validated['rol_id'],
                'activo' => $validated['activo'] ?? true,
                'es_super_admin' => false,
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
            ->route('configuracion.usuarios.index')
            ->with('success', 'Usuario creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $usuario)
    {
        $usuario->load('rol.permisos');

        return Inertia::render('Config/Usuario/Show', [
            'usuario' => $usuario,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $usuario)
    {
        // No permitir editar super admins
        if ($usuario->es_super_admin) {
            return back()->with('error', 'No se pueden editar usuarios super administradores');
        }

        $usuario->load('rol');
        $roles = Rol::activos()->orderBy('nombre')->get();

        return Inertia::render('Config/Usuario/Edit', [
            'usuario' => $usuario,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $usuario)
    {
        // No permitir editar super admins
        if ($usuario->es_super_admin) {
            return back()->with('error', 'No se pueden editar usuarios super administradores');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $usuario->id,
            'password' => 'nullable|string|min:8|confirmed',
            'rol_id' => 'required|exists:cnf__roles,id',
            'activo' => 'boolean',
        ]);

        DB::transaction(function () use ($usuario, $validated) {
            $datosAnteriores = $usuario->toArray();

            $datos = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'rol_id' => $validated['rol_id'],
                'activo' => $validated['activo'] ?? true,
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
            ->route('configuracion.usuarios.show', $usuario)
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
            ->route('configuracion.usuarios.index')
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
