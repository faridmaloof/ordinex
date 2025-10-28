<?php

namespace App\Http\Controllers\Auditoria;

use App\Http\Controllers\Controller;
use App\Models\Auditoria\ModificacionAutorizada;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModificacionAutorizadaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = ModificacionAutorizada::with(['usuarioSolicita', 'usuarioAutoriza']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tipo_documento', 'like', "%{$search}%")
                    ->orWhereHas('usuarioSolicita', function ($userQuery) use ($search) {
                        $userQuery->where('nombre', 'like', "%{$search}%");
                    })
                    ->orWhereHas('usuarioAutoriza', function ($userQuery) use ($search) {
                        $userQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        $modificaciones = $query->latest('fecha_autorizacion')->paginate(15)->withQueryString();

        return Inertia::render('Auditoria/ModificacionesAutorizadas/Index', [
            'modificaciones' => $modificaciones,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(ModificacionAutorizada $modificacionAutorizada): Response
    {
        $modificacionAutorizada->load(['usuarioSolicita', 'usuarioAutoriza']);

        return Inertia::render('Auditoria/ModificacionesAutorizadas/Show', [
            'modificacion' => $modificacionAutorizada,
        ]);
    }
}