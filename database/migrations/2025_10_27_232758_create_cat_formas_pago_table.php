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
        Schema::create('cat__formas_pago', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 20)->comment('efectivo, tarjeta, transferencia, cheque, otro');
            $table->boolean('requiere_referencia')->default(false);
            $table->boolean('genera_movimiento_caja')->default(true);
            $table->boolean('requiere_autorizacion')->default(false);
            $table->integer('orden')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
            
            $table->index('tipo');
            $table->index('activa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cat__formas_pago');
    }
};
