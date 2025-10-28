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
        Schema::create('trx__movimientos_caja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_id')->constrained('trx__cajas')->onDelete('cascade');
            $table->enum('tipo', ['ingreso', 'egreso', 'apertura', 'cierre', 'ajuste'])->default('ingreso');
            $table->string('concepto', 200);
            $table->decimal('monto', 12, 2);
            $table->foreignId('pago_id')->nullable()->constrained('trx__pagos')->nullOnDelete();
            $table->foreignId('forma_pago_id')->nullable()->constrained('cat__formas_pago')->nullOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('restrict');
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha_hora_movimiento')->useCurrent();
            $table->timestamps();
            
            $table->index(['caja_id', 'tipo']);
            $table->index('pago_id');
            $table->index('fecha_hora_movimiento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trx__movimientos_caja');
    }
};
