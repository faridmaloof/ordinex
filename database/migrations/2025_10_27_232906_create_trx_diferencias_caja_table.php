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
        Schema::create('trx__diferencias_caja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_id')->constrained('trx__cajas')->onDelete('cascade');
            $table->decimal('monto_diferencia', 12, 2);
            $table->enum('tipo_diferencia', ['sobrante', 'faltante']);
            $table->enum('estado', ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'ajustada'])->default('pendiente');
            $table->foreignId('usuario_reporta_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('supervisor_revisa_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_revision')->nullable();
            $table->enum('clasificacion', ['error_conteo', 'cuenta_por_pagar', 'descuento_nomina', 'error_sistema', 'otra'])->nullable();
            $table->text('descripcion')->nullable();
            $table->text('resolucion')->nullable();
            $table->json('documentos_soporte')->nullable();
            $table->timestamps();
            
            $table->index(['caja_id', 'estado']);
            $table->index('tipo_diferencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trx__diferencias_caja');
    }
};
