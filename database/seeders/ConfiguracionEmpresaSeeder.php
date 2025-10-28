<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Config\ConfiguracionEmpresa;

class ConfiguracionEmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ConfiguracionEmpresa::create([
            'razon_social' => 'Ordinex S.A.S.',
            'nombre_comercial' => 'Ordinex',
            'nit' => '900123456-7',
            'direccion' => 'Calle 123 # 45-67, Bogotá D.C., Colombia',
            'telefono' => '+57 300 123 4567',
            'email' => 'info@ordinex.com',
            'sitio_web' => 'https://ordinex.com',
            'logo_path' => null,
            'logo_pequeno_path' => null,
            'moneda_codigo' => 'COP',
            'moneda_simbolo' => '$',
            'moneda_decimales' => 0,
            'zona_horaria' => 'America/Bogota',
            'formato_fecha' => 'Y-m-d',
            'formato_hora' => 'H:i:s',
            'tiempo_estimado_servicio_default' => 60,
            'requiere_autorizacion_solicitudes' => true,
            'permite_edicion_solicitudes_autorizadas' => false,
            'genera_orden_automatica' => true,
            'requiere_pago_antes_entrega' => true,
            'porcentaje_anticipo_minimo' => 50.00,
            'activa' => true,
        ]);

        $this->command->info('✓ Configuración de Empresa creada');
    }
}

