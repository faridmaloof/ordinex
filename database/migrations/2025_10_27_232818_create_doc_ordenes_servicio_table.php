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
        Schema::create('doc__ordenes_servicio', function (Blueprint $table) {
            $table->id();
            $table->string('numero_orden', 50)->unique();
            $table->foreignId('solicitud_id')->constrained('doc__solicitudes')->onDelete('restrict');
            $table->foreignId('cliente_id')->constrained('cat__clientes')->onDelete('restrict');
            $table->date('fecha_orden');
            $table->timestamp('fecha_hora_inicio')->nullable();
            $table->timestamp('fecha_hora_fin_estimada')->nullable();
            $table->timestamp('fecha_hora_fin_real')->nullable();
            $table->enum('estado', ['pendiente', 'en_proceso', 'pausada', 'completada', 'entregada', 'anulada'])->default('pendiente');
            $table->foreignId('tecnico_asignado_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('tiempo_estimado_total')->default(0)->comment('Minutos');
            $table->integer('tiempo_real_total')->default(0)->comment('Minutos');
            $table->decimal('total', 12, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->integer('prioridad')->default(5)->comment('1=más alta, 10=más baja');
            $table->timestamps();
            
            $table->index(['estado', 'fecha_orden']);
            $table->index('solicitud_id');
            $table->index('cliente_id');
            $table->index('tecnico_asignado_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__ordenes_servicio');
    }
};
