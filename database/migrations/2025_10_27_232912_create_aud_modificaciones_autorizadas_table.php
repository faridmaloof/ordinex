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
        Schema::create('aud__modificaciones_autorizadas', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_documento', 50)->comment('solicitud, orden, entrega');
            $table->unsignedBigInteger('documento_id');
            $table->foreignId('usuario_solicita_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('usuario_autoriza_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('metodo_autorizacion', ['clave_diaria', 'tarjeta', 'clave_usuario', 'biometrico']);
            $table->string('clave_utilizada', 100)->nullable();
            $table->text('razon_modificacion');
            $table->json('campos_modificados');
            $table->json('valores_anteriores')->nullable();
            $table->json('valores_nuevos')->nullable();
            $table->enum('estado', ['pendiente', 'autorizada', 'rechazada'])->default('pendiente');
            $table->timestamp('fecha_autorizacion')->nullable();
            $table->timestamps();
            
            $table->index(['tipo_documento', 'documento_id']);
            $table->index(['usuario_solicita_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aud__modificaciones_autorizadas');
    }
};
