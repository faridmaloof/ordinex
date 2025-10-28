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
        Schema::create('doc__ordenes_servicio_historial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_id')->constrained('doc__ordenes_servicio')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('restrict');
            $table->string('accion', 100)->comment('cambio_estado, asignacion_tecnico, pausa, reanudacion, etc');
            $table->string('estado_anterior', 50)->nullable();
            $table->string('estado_nuevo', 50)->nullable();
            $table->json('datos_adicionales')->nullable();
            $table->text('comentario')->nullable();
            $table->timestamps();
            
            $table->index(['orden_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__ordenes_servicio_historial');
    }
};
