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
        Schema::create('trx__pagos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_pago', 50)->unique();
            $table->foreignId('cliente_id')->constrained('cat__clientes')->onDelete('restrict');
            $table->foreignId('entrega_id')->nullable()->constrained('doc__entregas')->nullOnDelete();
            $table->foreignId('forma_pago_id')->constrained('cat__formas_pago')->onDelete('restrict');
            $table->enum('tipo', ['pago', 'anticipo', 'saldo_favor'])->default('pago');
            $table->decimal('monto', 12, 2);
            $table->date('fecha_pago');
            $table->timestamp('fecha_hora_pago')->useCurrent();
            $table->foreignId('usuario_registra_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('caja_id')->nullable()->constrained('trx__cajas')->nullOnDelete();
            $table->string('referencia', 100)->nullable();
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['activo', 'anulado'])->default('activo');
            $table->foreignId('usuario_anula_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_anulacion')->nullable();
            $table->text('razon_anulacion')->nullable();
            $table->timestamps();
            
            $table->index(['tipo', 'fecha_pago']);
            $table->index('cliente_id');
            $table->index('entrega_id');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trx__pagos');
    }
};
