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
            $table->string('erp_id', 50)->unique()->nullable()->comment('ID en SaiOpen ERP');
            $table->string('tipo_cliente', 20)->default('natural')->comment('natural, juridico');
            $table->string('tipo_documento', 20)->default('CC')->comment('CC, NIT, CE, Pasaporte');
            $table->string('numero_documento', 20)->unique();
            $table->string('nombre', 255)->comment('Nombre completo o razón social');
            $table->string('telefono', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('direccion')->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->foreignId('vendedor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('saldo_favor', 12, 2)->default(0)->comment('Saldo a favor (anticipos)');
            $table->decimal('limite_credito', 12, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->boolean('sincronizado_erp')->default(false);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->index('tipo_cliente');
            $table->index('tipo_documento');
            $table->index('numero_documento');
            $table->index('activo');
            $table->index('email');
            $table->index('vendedor_id');
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
