<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cnf__configuracion_empresa', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social', 200);
            $table->string('nombre_comercial', 200)->nullable();
            $table->string('nit', 50)->unique();
            $table->string('direccion', 300)->nullable();
            $table->string('telefono', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('sitio_web', 200)->nullable();
            $table->string('logo_path', 500)->nullable();
            $table->string('logo_pequeno_path', 500)->nullable();
            $table->string('moneda_codigo', 10)->default('COP');
            $table->string('moneda_simbolo', 10)->default('$');
            $table->integer('moneda_decimales')->default(0);
            $table->string('zona_horaria', 50)->default('America/Bogota');
            $table->string('formato_fecha', 20)->default('Y-m-d');
            $table->string('formato_hora', 20)->default('H:i:s');
            $table->integer('tiempo_estimado_servicio_default')->default(60)->comment('Minutos');
            $table->boolean('requiere_autorizacion_solicitudes')->default(true);
            $table->boolean('permite_edicion_solicitudes_autorizadas')->default(false);
            $table->boolean('genera_orden_automatica')->default(true);
            $table->boolean('requiere_pago_antes_entrega')->default(true);
            $table->decimal('porcentaje_anticipo_minimo', 5, 2)->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cnf__configuracion_empresa');
    }
};
