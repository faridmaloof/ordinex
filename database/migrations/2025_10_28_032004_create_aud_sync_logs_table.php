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
        Schema::create('aud_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['clientes', 'items', 'ambos']);
            $table->dateTime('fecha_sync');
            $table->integer('registros_nuevos')->default(0);
            $table->integer('registros_actualizados')->default(0);
            $table->integer('errores')->default(0);
            $table->text('detalle_errores')->nullable();
            $table->foreignId('usuario_ejecuta_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('tipo_ejecucion', ['automatica', 'manual'])->default('automatica');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aud_sync_logs');
    }
};