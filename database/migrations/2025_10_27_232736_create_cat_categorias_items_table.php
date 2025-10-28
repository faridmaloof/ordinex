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
        Schema::create('cat__categorias_items', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 20)->comment('producto, servicio, ambos');
            $table->foreignId('categoria_padre_id')->nullable()->constrained('cat__categorias_items')->nullOnDelete();
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
        Schema::dropIfExists('cat__categorias_items');
    }
};
