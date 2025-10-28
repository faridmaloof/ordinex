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
        Schema::create('trx__cajas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_config_id')->constrained('cnf__cajas')->onDelete('restrict');
            $table->foreignId('usuario_apertura_id')->constrained('users')->onDelete('restrict');
            $table->date('fecha');
            $table->timestamp('fecha_hora_apertura')->useCurrent();
            $table->timestamp('fecha_hora_cierre')->nullable();
            $table->decimal('monto_apertura', 12, 2)->default(0);
            $table->json('desglose_apertura')->nullable()->comment('Billetes y monedas');
            $table->decimal('total_ingresos', 12, 2)->default(0);
            $table->decimal('total_egresos', 12, 2)->default(0);
            $table->decimal('total_efectivo_esperado', 12, 2)->default(0);
            $table->decimal('total_efectivo_real', 12, 2)->default(0);
            $table->json('desglose_cierre')->nullable();
            $table->decimal('diferencia', 12, 2)->default(0);
            $table->enum('estado', ['abierta', 'cerrada_cuadrada', 'cerrada_con_diferencia', 'anulada'])->default('abierta');
            $table->foreignId('usuario_cierre_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('observaciones_apertura')->nullable();
            $table->text('observaciones_cierre')->nullable();
            $table->timestamps();
            
            $table->index(['caja_config_id', 'fecha']);
            $table->index(['estado', 'fecha']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trx__cajas');
    }
};
