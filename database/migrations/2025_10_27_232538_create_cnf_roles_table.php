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
        Schema::create('cnf__roles', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('nivel_jerarquico')->comment('1=más alto, 10=más bajo');
            $table->boolean('puede_modificar_autorizados')->default(false);
            $table->boolean('requiere_clave_diaria')->default(false);
            $table->boolean('puede_cerrar_caja_con_diferencia')->default(false);
            $table->boolean('es_super_admin')->default(false)->comment('Super admin oculto del sistema');
            $table->boolean('es_sistema')->default(false)->comment('Rol del sistema no modificable');
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->index('nivel_jerarquico');
            $table->index('es_super_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cnf__roles');
    }
};
