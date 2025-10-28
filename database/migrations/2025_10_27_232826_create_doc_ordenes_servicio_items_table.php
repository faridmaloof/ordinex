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
        Schema::create('doc__ordenes_servicio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_id')->constrained('doc__ordenes_servicio')->onDelete('cascade');
            $table->foreignId('solicitud_item_id')->constrained('doc__solicitudes_items')->onDelete('restrict');
            $table->foreignId('item_id')->constrained('cat__items')->onDelete('restrict');
            $table->integer('cantidad');
            $table->enum('estado', ['pendiente', 'en_proceso', 'completado', 'validado'])->default('pendiente');
            $table->timestamp('fecha_hora_inicio')->nullable();
            $table->timestamp('fecha_hora_fin')->nullable();
            $table->integer('tiempo_estimado')->default(0)->comment('Minutos');
            $table->integer('tiempo_real')->default(0)->comment('Minutos');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index('orden_id');
            $table->index(['estado', 'fecha_hora_inicio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__ordenes_servicio_items');
    }
};
