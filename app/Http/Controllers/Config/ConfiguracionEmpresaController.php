<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;
use App\Models\Config\ConfiguracionEmpresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConfiguracionEmpresaController extends Controller
{
    /**
     * Mostrar configuración actual
     */
    public function index()
    {
        $configuracion = ConfiguracionEmpresa::first();

        return Inertia::render('Config/ConfiguracionEmpresa/Index', [
            'configuracion' => $configuracion,
        ]);
    }

    /**
     * Formulario de edición
     */
    public function edit()
    {
        $configuracion = ConfiguracionEmpresa::first();

        if (!$configuracion) {
            $configuracion = ConfiguracionEmpresa::create([
                'razon_social' => 'Mi Empresa',
                'nit' => '000000000',
                'direccion' => 'Dirección',
                'telefono' => '0000000',
                'email' => 'info@empresa.com',
                'moneda_codigo' => 'COP',
                'moneda_simbolo' => '$',
                'moneda_decimales' => 0,
                'activa' => true,
            ]);
        }

        return Inertia::render('Config/ConfiguracionEmpresa/Edit', [
            'configuracion' => $configuracion,
        ]);
    }

    /**
     * Actualizar configuración
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string|max:200',
            'nit' => 'required|string|max:50',
            'direccion' => 'required|string|max:500',
            'telefono' => 'nullable|string|max:50',
            'celular' => 'nullable|string|max:50',
            'email' => 'required|email|max:100',
            'sitio_web' => 'nullable|url|max:200',
            'moneda_codigo' => 'required|string|max:3',
            'moneda_simbolo' => 'required|string|max:5',
            'moneda_decimales' => 'required|integer|min:0|max:4',
            'requiere_autorizacion_solicitudes' => 'boolean',
            'genera_orden_automatica' => 'boolean',
            'requiere_pago_antes_entrega' => 'boolean',
            'porcentaje_anticipo_minimo' => 'nullable|numeric|min:0|max:100',
            'activa' => 'boolean',
            'logo' => 'nullable|image|max:2048',
            'logo_pequeno' => 'nullable|image|max:1024',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $configuracion = ConfiguracionEmpresa::first();

                if (!$configuracion) {
                    $configuracion = new ConfiguracionEmpresa();
                }

                $datosAnteriores = $configuracion->toArray();

                // Manejar logos
                if (request()->hasFile('logo')) {
                    if ($configuracion->logo_path) {
                        Storage::disk('public')->delete($configuracion->logo_path);
                    }
                    $logoPath = request()->file('logo')->store('logos', 'public');
                    $validated['logo_path'] = $logoPath;
                }

                if (request()->hasFile('logo_pequeno')) {
                    if ($configuracion->logo_pequeno_path) {
                        Storage::disk('public')->delete($configuracion->logo_pequeno_path);
                    }
                    $logoPath = request()->file('logo_pequeno')->store('logos', 'public');
                    $validated['logo_pequeno_path'] = $logoPath;
                }

                $configuracion->fill($validated);
                $configuracion->save();

                // Registrar auditoría
                \App\Models\Auditoria\Auditoria::registrar(
                    'actualizar',
                    'configuracion_empresa',
                    'cnf__configuracion_empresa',
                    $configuracion->id,
                    $datosAnteriores,
                    $configuracion->fresh()->toArray()
                );
            });

            return redirect()
                ->route('configuracion.empresa.index')
                ->with('success', 'Configuración actualizada exitosamente');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }
}
