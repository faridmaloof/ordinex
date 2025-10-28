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
        Schema::create('doc__solicitudes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_solicitud', 50)->unique();
            $table->date('fecha_solicitud');
            $table->foreignId('cliente_id')->constrained('cat__clientes')->onDelete('cascade');
            $table->foreignId('usuario_crea_id')->constrained('users')->onDelete('restrict');
            $table->enum('estado', ['borrador', 'pendiente_autorizacion', 'parcialmente_autorizada', 'autorizada', 'rechazada', 'anulada'])->default('borrador');
            $table->foreignId('usuario_autoriza_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_autorizacion')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('iva', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->text('razon_rechazo')->nullable();
            $table->boolean('genera_orden')->default(false);
            $table->timestamp('bloqueada_en')->nullable()->comment('Cuando se autoriza, se bloquea');
            $table->timestamps();
            
            $table->index(['estado', 'fecha_solicitud']);
            $table->index('cliente_id');
            $table->index('usuario_crea_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc__solicitudes');
    }
};
