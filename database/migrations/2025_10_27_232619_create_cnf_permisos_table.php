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
        Schema::create('cnf__permisos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('modulo', 50)->comment('configuracion, catalogo, solicitud, orden, entrega, caja, reporte');
            $table->string('accion', 50)->comment('ver, crear, editar, eliminar, autorizar, etc');
            $table->boolean('es_sistema')->default(false);
            $table->timestamps();
            
            $table->index(['modulo', 'accion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cnf__permisos');
    }
};
