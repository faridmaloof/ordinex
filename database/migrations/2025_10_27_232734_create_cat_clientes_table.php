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
        Schema::create('cat__clientes', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_documento', 20)->default('CC');
            $table->string('numero_documento', 50)->unique();
            $table->string('nombre_completo', 200);
            $table->string('razon_social', 200)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('telefono', 50)->nullable();
            $table->string('celular', 50)->nullable();
            $table->string('direccion', 300)->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->decimal('saldo_favor', 12, 2)->default(0)->comment('Anticipos disponibles');
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->index('numero_documento');
            $table->index('activo');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cat__clientes');
    }
};
