<?php

namespace App\Http\Controllers\Integracion;

use App\Http\Controllers\Controller;
use App\Models\Integracion\SyncLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SyncLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = SyncLog::with('usuario');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tipo', 'like', "%{$search}%")
                    ->orWhere('tipo_ejecucion', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest('fecha_sync')->paginate(15)->withQueryString();

        return Inertia::render('Integracion/SyncLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(SyncLog $syncLog): Response
    {
        $syncLog->load('usuario');

        return Inertia::render('Integracion/SyncLogs/Show', [
            'log' => $syncLog,
        ]);
    }
}