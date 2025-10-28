<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('==============================================');
        $this->command->info('🌱 Iniciando Seeders - Sistema Ordinex');
        $this->command->info('==============================================');
        $this->command->info('');

        // 1. Configuración de Empresa
        $this->command->info('1️⃣  Configuración de Empresa...');
        $this->call(ConfiguracionEmpresaSeeder::class);
        
        // 2. Roles y Permisos
        $this->command->info('');
        $this->command->info('2️⃣  Roles y Permisos...');
        $this->call(RolesYPermisosSeeder::class);
        
        // 3. Formas de Pago
        $this->command->info('');
        $this->command->info('3️⃣  Formas de Pago...');
        $this->call(FormasPagoSeeder::class);

        $this->command->info('');
        $this->command->info('==============================================');
        $this->command->info('✅ Seeders completados exitosamente');
        $this->command->info('==============================================');
        $this->command->info('');
        $this->command->info('📝 Para crear un Super Admin, ejecuta:');
        $this->command->info('   php artisan super-admin crear --email=admin@ordinex.com --password=Admin123');
        $this->command->info('');
    }
}

