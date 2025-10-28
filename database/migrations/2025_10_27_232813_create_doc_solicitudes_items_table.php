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
        Schema::create('doc__solicitudes_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('doc__solicitudes')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('cat__items')->onDelete('restrict');
            $table->integer('cantidad')->default(1);
            $table->decimal('precio_unitario', 12, 2);
            $table->decimal('porcentaje_descuento', 5, 2)->default(0);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->boolean('aplica_iva')->default(false);
            $table->decimal('porcentaje_iva', 5, 2)->default(0);
            $table->decimal('iva', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->enum('estado_autorizacion', ['pendiente', 'autorizado', 'rechazado'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index('solicitud_id');
            $table->index('item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__solicitudes_items');
    }
};
