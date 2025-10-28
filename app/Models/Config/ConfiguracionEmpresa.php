<?php

namespace App\Models\Config;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionEmpresa extends Model
{
    protected $table = 'cnf__configuracion_empresa';

    protected $fillable = [
        'razon_social',
        'nombre_comercial',
        'nit',
        'direccion',
        'telefono',
        'email',
        'sitio_web',
        'logo_path',
        'logo_pequeno_path',
        'moneda_codigo',
        'moneda_simbolo',
        'moneda_decimales',
        'zona_horaria',
        'formato_fecha',
        'formato_hora',
        'tiempo_estimado_servicio_default',
        'requiere_autorizacion_solicitudes',
        'permite_edicion_solicitudes_autorizadas',
        'genera_orden_automatica',
        'requiere_pago_antes_entrega',
        'porcentaje_anticipo_minimo',
        'activa',
    ];

    protected $casts = [
        'requiere_autorizacion_solicitudes' => 'boolean',
        'permite_edicion_solicitudes_autorizadas' => 'boolean',
        'genera_orden_automatica' => 'boolean',
        'requiere_pago_antes_entrega' => 'boolean',
        'porcentaje_anticipo_minimo' => 'decimal:2',
        'activa' => 'boolean',
        'moneda_decimales' => 'integer',
        'tiempo_estimado_servicio_default' => 'integer',
    ];

    /**
     * Obtener la configuración activa del sistema
     */
    public static function getConfiguracion()
    {
        return static::where('activa', true)->first() ?? new static();
    }

    /**
     * Formatear moneda según configuración
     */
    public function formatearMoneda($valor)
    {
        return $this->moneda_simbolo . ' ' . number_format($valor, $this->moneda_decimales, ',', '.');
    }
}
