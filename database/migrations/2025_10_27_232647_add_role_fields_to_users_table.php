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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('rol_id')->nullable()->after('email')->constrained('cnf__roles')->nullOnDelete();
            $table->foreignId('caja_defecto_id')->nullable()->after('rol_id')->constrained('cnf__cajas')->nullOnDelete();
            $table->boolean('es_super_admin')->default(false)->after('caja_defecto_id')->comment('Usuario super admin oculto');
            $table->boolean('activo')->default(true)->after('es_super_admin');
            $table->string('telefono', 50)->nullable()->after('email');
            $table->string('documento', 50)->nullable()->after('telefono');
            $table->timestamp('ultima_conexion')->nullable()->after('activo');
            
            $table->index('es_super_admin');
            $table->index('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['rol_id']);
            $table->dropForeign(['caja_defecto_id']);
            $table->dropColumn([
                'rol_id',
                'caja_defecto_id',
                'es_super_admin',
                'activo',
                'telefono',
                'documento',
                'ultima_conexion'
            ]);
        });
    }
};
