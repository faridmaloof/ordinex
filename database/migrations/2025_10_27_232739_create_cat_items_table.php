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
        Schema::create('cat__items', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 20)->comment('producto, servicio');
            $table->foreignId('categoria_id')->nullable()->constrained('cat__categorias_items')->nullOnDelete();
            $table->decimal('precio_base', 12, 2)->default(0);
            $table->decimal('costo', 12, 2)->default(0);
            $table->boolean('aplica_iva')->default(false);
            $table->decimal('porcentaje_iva', 5, 2)->default(0);
            $table->integer('tiempo_estimado')->default(60)->comment('Minutos para servicios');
            $table->boolean('requiere_autorizacion')->default(false);
            $table->boolean('maneja_inventario')->default(false);
            $table->integer('stock_actual')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->string('unidad_medida', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->index(['tipo', 'activo']);
            $table->index('categoria_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cat__items');
    }
};
