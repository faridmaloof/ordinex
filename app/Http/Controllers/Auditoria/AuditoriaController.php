<?php

namespace App\Http\Controllers\Auditoria;

use App\Http\Controllers\Controller;
use App\Models\Auditoria\Auditoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Auditoria::with('usuario');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tabla', 'like', "%{$search}%")
                    ->orWhere('accion', 'like', "%{$search}%")
                    ->orWhereHas('usuario', function ($userQuery) use ($search) {
                        $userQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        $auditorias = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Auditoria/Index', [
            'auditorias' => $auditorias,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Auditoria $auditoria): Response
    {
        $auditoria->load('usuario');

        return Inertia::render('Auditoria/Show', [
            'auditoria' => $auditoria,
        ]);
    }
}