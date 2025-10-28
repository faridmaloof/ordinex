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
        Schema::create('aud__auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('accion', 100);
            $table->string('modulo', 50);
            $table->string('tabla', 100)->nullable();
            $table->unsignedBigInteger('registro_id')->nullable();
            $table->json('datos_anteriores')->nullable();
            $table->json('datos_nuevos')->nullable();
            $table->ipAddress('ip');
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['usuario_id', 'created_at']);
            $table->index(['modulo', 'accion']);
            $table->index(['tabla', 'registro_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aud__auditoria');
    }
};
