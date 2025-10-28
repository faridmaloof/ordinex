<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GestionarSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'super-admin {action : crear, restablecer, listar} {--email= : Email del super admin} {--password= : Nueva contraseña}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gestionar usuarios Super Admin del sistema (crear, restablecer, listar)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'crear':
                return $this->crearSuperAdmin();
            case 'restablecer':
                return $this->restablecerSuperAdmin();
            case 'listar':
                return $this->listarSuperAdmins();
            default:
                $this->error("Acción no válida. Use: crear, restablecer o listar");
                return Command::FAILURE;
        }
    }

    /**
     * Crear un nuevo Super Admin
     */
    protected function crearSuperAdmin()
    {
        $this->info('=== CREAR SUPER ADMIN ===');
        $this->warn('⚠️  El Super Admin tendrá acceso total al sistema y no aparecerá en listados normales');
        $this->newLine();

        // Solicitar nombre
        $nombre = $this->ask('Nombre completo del Super Admin');
        if (empty($nombre)) {
            $this->error('El nombre es obligatorio');
            return Command::FAILURE;
        }

        // Solicitar email
        $email = $this->option('email') ?: $this->ask('Email del Super Admin');
        
        // Validar email
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email'
        ]);

        if ($validator->fails()) {
            $this->error('Email inválido o ya existe: ' . $validator->errors()->first('email'));
            return Command::FAILURE;
        }

        // Solicitar contraseña
        $password = $this->option('password') ?: $this->secret('Contraseña (mínimo 8 caracteres)');
        $passwordConfirm = $this->secret('Confirmar contraseña');

        if ($password !== $passwordConfirm) {
            $this->error('Las contraseñas no coinciden');
            return Command::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('La contraseña debe tener al menos 8 caracteres');
            return Command::FAILURE;
        }

        // Confirmación
        if (!$this->confirm('¿Está seguro de crear este Super Admin?', true)) {
            $this->info('Operación cancelada');
            return Command::SUCCESS;
        }

        try {
            $user = User::create([
                'name' => $nombre,
                'email' => $email,
                'password' => Hash::make($password),
                'es_super_admin' => true,
                'activo' => true,
                'email_verified_at' => now(),
            ]);

            $this->newLine();
            $this->info('✅ Super Admin creado exitosamente');
            $this->table(
                ['Campo', 'Valor'],
                [
                    ['ID', $user->id],
                    ['Nombre', $user->name],
                    ['Email', $user->email],
                    ['Creado', $user->created_at->format('Y-m-d H:i:s')],
                ]
            );

            $this->newLine();
            $this->warn('🔐 IMPORTANTE: Guarde estas credenciales en un lugar seguro');
            $this->warn('   Email: ' . $email);
            $this->warn('   Contraseña: ********** (la que acaba de crear)');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error al crear Super Admin: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Restablecer contraseña de un Super Admin
     */
    protected function restablecerSuperAdmin()
    {
        $this->info('=== RESTABLECER SUPER ADMIN ===');
        $this->newLine();

        // Listar super admins existentes
        $superAdmins = User::where('es_super_admin', true)->get();

        if ($superAdmins->isEmpty()) {
            $this->error('No hay Super Admins registrados en el sistema');
            $this->info('Use: php artisan super-admin crear');
            return Command::FAILURE;
        }

        $this->info('Super Admins disponibles:');
        $this->table(
            ['ID', 'Nombre', 'Email'],
            $superAdmins->map(fn($u) => [$u->id, $u->name, $u->email])
        );
        $this->newLine();

        // Solicitar email
        $email = $this->option('email') ?: $this->ask('Email del Super Admin a restablecer');
        
        $user = User::where('email', $email)
            ->where('es_super_admin', true)
            ->first();

        if (!$user) {
            $this->error('Super Admin no encontrado con ese email');
            return Command::FAILURE;
        }

        // Solicitar nueva contraseña
        $password = $this->option('password') ?: $this->secret('Nueva contraseña (mínimo 8 caracteres)');
        $passwordConfirm = $this->secret('Confirmar nueva contraseña');

        if ($password !== $passwordConfirm) {
            $this->error('Las contraseñas no coinciden');
            return Command::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('La contraseña debe tener al menos 8 caracteres');
            return Command::FAILURE;
        }

        // Confirmación
        if (!$this->confirm("¿Restablecer contraseña para {$user->name} ({$user->email})?", true)) {
            $this->info('Operación cancelada');
            return Command::SUCCESS;
        }

        try {
            $user->update([
                'password' => Hash::make($password),
                'activo' => true, // Reactivar por si estaba inactivo
            ]);

            $this->newLine();
            $this->info('✅ Contraseña restablecida exitosamente');
            $this->warn('🔐 Nueva contraseña configurada para: ' . $user->email);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error al restablecer contraseña: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Listar Super Admins
     */
    protected function listarSuperAdmins()
    {
        $this->info('=== SUPER ADMINS DEL SISTEMA ===');
        $this->newLine();

        $superAdmins = User::where('es_super_admin', true)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($superAdmins->isEmpty()) {
            $this->warn('⚠️  No hay Super Admins registrados');
            $this->info('Use: php artisan super-admin crear');
            return Command::SUCCESS;
        }

        $this->table(
            ['ID', 'Nombre', 'Email', 'Activo', 'Última Conexión', 'Creado'],
            $superAdmins->map(function($user) {
                return [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->activo ? '✅' : '❌',
                    $user->ultima_conexion?->format('Y-m-d H:i') ?? 'Nunca',
                    $user->created_at->format('Y-m-d H:i'),
                ];
            })
        );

        $this->newLine();
        $this->info('Total: ' . $superAdmins->count() . ' Super Admin(s)');

        return Command::SUCCESS;
    }
}
