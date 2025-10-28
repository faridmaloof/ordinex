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
        Schema::create('cnf__roles_permisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rol_id')->constrained('cnf__roles')->onDelete('cascade');
            $table->foreignId('permiso_id')->constrained('cnf__permisos')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['rol_id', 'permiso_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cnf__roles_permisos');
    }
};
