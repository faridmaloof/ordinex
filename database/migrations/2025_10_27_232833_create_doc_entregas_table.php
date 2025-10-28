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
        Schema::create('doc__entregas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_entrega', 50)->unique();
            $table->foreignId('orden_id')->constrained('doc__ordenes_servicio')->onDelete('restrict');
            $table->foreignId('cliente_id')->constrained('cat__clientes')->onDelete('restrict');
            $table->date('fecha_entrega');
            $table->timestamp('fecha_hora_entrega')->nullable();
            $table->foreignId('usuario_entrega_id')->constrained('users')->onDelete('restrict');
            $table->string('recibe_nombre', 200)->nullable();
            $table->string('recibe_documento', 50)->nullable();
            $table->enum('estado', ['pendiente', 'entregada', 'anulada'])->default('pendiente');
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('total_pagado', 12, 2)->default(0);
            $table->decimal('saldo_pendiente', 12, 2)->default(0);
            $table->boolean('permite_entrega_con_saldo')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index(['estado', 'fecha_entrega']);
            $table->index('orden_id');
            $table->index('cliente_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__entregas');
    }
};
