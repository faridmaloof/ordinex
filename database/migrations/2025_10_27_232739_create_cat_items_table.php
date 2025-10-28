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
            $table->string('erp_id', 50)->unique()->nullable()->comment('ID en SaiOpen ERP');
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 20)->comment('producto, servicio');
            $table->foreignId('categoria_id')->nullable()->constrained('cat__categorias_items')->nullOnDelete();
            $table->string('categoria_erp', 100)->nullable()->comment('Categoría desde ERP');
            $table->decimal('precio_base', 12, 2);
            $table->decimal('precio_venta', 12, 2);
            $table->decimal('costo', 12, 2)->default(0);
            $table->string('unidad_medida', 20)->default('unidad');
            $table->decimal('iva', 5, 2)->default(19.00)->comment('Porcentaje IVA');
            $table->integer('tiempo_estimado_servicio')->nullable()->comment('Minutos para servicios');
            $table->string('imagen', 500)->nullable();
            $table->boolean('activo')->default(true);
            $table->boolean('permite_edicion')->default(true)->comment('Permite edición de precio en solicitud');
            
            // Campos adicionales para manejo de inventario (extensión del sistema base)
            $table->boolean('maneja_inventario')->default(false);
            $table->integer('stock_actual')->default(0);
            $table->integer('stock_minimo')->default(0);
            
            $table->timestamps();
            
            $table->index(['tipo', 'activo']);
            $table->index('categoria_id');
            $table->index('codigo');
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
