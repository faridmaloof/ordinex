<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;
use App\Models\Config\ClaveDiaria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClaveDiariaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $claveHoy = ClaveDiaria::getClaveHoy();
        $historial = ClaveDiaria::with('usuarioGenera')->latest('fecha')->take(7)->get();

        return Inertia::render('Config/ClavesDiarias/Index', [
            'claveHoy' => $claveHoy,
            'historial' => $historial,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(): RedirectResponse
    {
        // Optional: Add authorization check to ensure only supervisors can generate a key.

        ClaveDiaria::generarParaHoy(Auth::id());

        return redirect()->route('claves-diarias.index')->with('success', 'Se ha generado una nueva clave para hoy.');
    }
}