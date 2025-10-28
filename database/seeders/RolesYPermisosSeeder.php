<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Config\Rol;
use App\Models\Config\Permiso;

class RolesYPermisosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ============================================
        // CREAR PERMISOS
        // ============================================
        $permisos = [
            // Configuración - Empresa
            ['codigo' => 'config.empresa.ver', 'nombre' => 'Ver Configuración Empresa', 'modulo' => 'configuracion', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'config.empresa.editar', 'nombre' => 'Editar Configuración Empresa', 'modulo' => 'configuracion', 'accion' => 'editar', 'es_sistema' => true],
            
            // Configuración - Roles
            ['codigo' => 'config.roles.ver', 'nombre' => 'Ver Roles', 'modulo' => 'configuracion', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'config.roles.crear', 'nombre' => 'Crear Roles', 'modulo' => 'configuracion', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'config.roles.editar', 'nombre' => 'Editar Roles', 'modulo' => 'configuracion', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'config.roles.eliminar', 'nombre' => 'Eliminar Roles', 'modulo' => 'configuracion', 'accion' => 'eliminar', 'es_sistema' => true],
            
            // Configuración - Permisos
            ['codigo' => 'config.permisos.ver', 'nombre' => 'Ver Permisos', 'modulo' => 'configuracion', 'accion' => 'ver', 'es_sistema' => true],
            
            // Configuración - Usuarios
            ['codigo' => 'config.usuarios.ver', 'nombre' => 'Ver Usuarios', 'modulo' => 'configuracion', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'config.usuarios.crear', 'nombre' => 'Crear Usuarios', 'modulo' => 'configuracion', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'config.usuarios.editar', 'nombre' => 'Editar Usuarios', 'modulo' => 'configuracion', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'config.usuarios.eliminar', 'nombre' => 'Eliminar Usuarios', 'modulo' => 'configuracion', 'accion' => 'eliminar', 'es_sistema' => true],
            
            // Configuración - Cajas
            ['codigo' => 'config.cajas.ver', 'nombre' => 'Ver Cajas', 'modulo' => 'configuracion', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'config.cajas.crear', 'nombre' => 'Crear Cajas', 'modulo' => 'configuracion', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'config.cajas.editar', 'nombre' => 'Editar Cajas', 'modulo' => 'configuracion', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'config.cajas.eliminar', 'nombre' => 'Eliminar Cajas', 'modulo' => 'configuracion', 'accion' => 'eliminar', 'es_sistema' => true],
            
            // Catálogo - Clientes
            ['codigo' => 'catalogo.clientes.ver', 'nombre' => 'Ver Clientes', 'modulo' => 'catalogo', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'catalogo.clientes.crear', 'nombre' => 'Crear Clientes', 'modulo' => 'catalogo', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'catalogo.clientes.editar', 'nombre' => 'Editar Clientes', 'modulo' => 'catalogo', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'catalogo.clientes.eliminar', 'nombre' => 'Eliminar Clientes', 'modulo' => 'catalogo', 'accion' => 'eliminar', 'es_sistema' => true],
            
            // Catálogo - Categorías
            ['codigo' => 'catalogo.categorias.ver', 'nombre' => 'Ver Categorías', 'modulo' => 'catalogo', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'catalogo.categorias.crear', 'nombre' => 'Crear Categorías', 'modulo' => 'catalogo', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'catalogo.categorias.editar', 'nombre' => 'Editar Categorías', 'modulo' => 'catalogo', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'catalogo.categorias.eliminar', 'nombre' => 'Eliminar Categorías', 'modulo' => 'catalogo', 'accion' => 'eliminar', 'es_sistema' => true],
            
            // Catálogo - Items
            ['codigo' => 'catalogo.items.ver', 'nombre' => 'Ver Items', 'modulo' => 'catalogo', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'catalogo.items.crear', 'nombre' => 'Crear Items', 'modulo' => 'catalogo', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'catalogo.items.editar', 'nombre' => 'Editar Items', 'modulo' => 'catalogo', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'catalogo.items.eliminar', 'nombre' => 'Eliminar Items', 'modulo' => 'catalogo', 'accion' => 'eliminar', 'es_sistema' => true],
            ['codigo' => 'catalogo.items.ajustar_stock', 'nombre' => 'Ajustar Stock Items', 'modulo' => 'catalogo', 'accion' => 'ajustar_stock', 'es_sistema' => true],
            
            // Solicitudes
            ['codigo' => 'solicitud.ver', 'nombre' => 'Ver Solicitudes', 'modulo' => 'solicitud', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'solicitud.crear', 'nombre' => 'Crear Solicitudes', 'modulo' => 'solicitud', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'solicitud.editar', 'nombre' => 'Editar Solicitudes', 'modulo' => 'solicitud', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'solicitud.eliminar', 'nombre' => 'Eliminar Solicitudes', 'modulo' => 'solicitud', 'accion' => 'eliminar', 'es_sistema' => true],
            ['codigo' => 'solicitud.autorizar', 'nombre' => 'Autorizar Solicitudes', 'modulo' => 'solicitud', 'accion' => 'autorizar', 'es_sistema' => true],
            
            // Órdenes de Servicio
            ['codigo' => 'orden.ver', 'nombre' => 'Ver Órdenes', 'modulo' => 'orden', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'orden.crear', 'nombre' => 'Crear Órdenes', 'modulo' => 'orden', 'accion' => 'crear', 'es_sistema' => true],
            ['codigo' => 'orden.editar', 'nombre' => 'Editar Órdenes', 'modulo' => 'orden', 'accion' => 'editar', 'es_sistema' => true],
            ['codigo' => 'orden.eliminar', 'nombre' => 'Eliminar Órdenes', 'modulo' => 'orden', 'accion' => 'eliminar', 'es_sistema' => true],
            ['codigo' => 'orden.iniciar', 'nombre' => 'Iniciar Órdenes', 'modulo' => 'orden', 'accion' => 'iniciar', 'es_sistema' => true],
            ['codigo' => 'orden.completar', 'nombre' => 'Completar Órdenes', 'modulo' => 'orden', 'accion' => 'completar', 'es_sistema' => true],
            ['codigo' => 'orden.entregar', 'nombre' => 'Entregar Órdenes', 'modulo' => 'orden', 'accion' => 'entregar', 'es_sistema' => true],
            
            // Caja
            ['codigo' => 'caja.acceder', 'nombre' => 'Acceder a Caja', 'modulo' => 'caja', 'accion' => 'acceder', 'es_sistema' => true],
            ['codigo' => 'caja.abrir', 'nombre' => 'Abrir Caja', 'modulo' => 'caja', 'accion' => 'abrir', 'es_sistema' => true],
            ['codigo' => 'caja.cerrar', 'nombre' => 'Cerrar Caja', 'modulo' => 'caja', 'accion' => 'cerrar', 'es_sistema' => true],
            ['codigo' => 'caja.cerrar_con_diferencia', 'nombre' => 'Cerrar Caja con Diferencia', 'modulo' => 'caja', 'accion' => 'cerrar', 'es_sistema' => true],
            ['codigo' => 'caja.ver_historial', 'nombre' => 'Ver Historial de Caja', 'modulo' => 'caja', 'accion' => 'ver', 'es_sistema' => true],
            
            // Pagos
            ['codigo' => 'pagos.ver', 'nombre' => 'Ver Pagos', 'modulo' => 'pagos', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'pagos.crear', 'nombre' => 'Registrar Pagos', 'modulo' => 'pagos', 'accion' => 'crear', 'es_sistema' => true],
            
            // Reportes
            ['codigo' => 'reportes.ventas', 'nombre' => 'Ver Reportes de Ventas', 'modulo' => 'reportes', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'reportes.caja', 'nombre' => 'Ver Reportes de Caja', 'modulo' => 'reportes', 'accion' => 'ver', 'es_sistema' => true],
            ['codigo' => 'reportes.clientes', 'nombre' => 'Ver Reportes de Clientes', 'modulo' => 'reportes', 'accion' => 'ver', 'es_sistema' => true],
        ];

        foreach ($permisos as $permiso) {
            Permiso::create($permiso);
        }

        $this->command->info('✓ Permisos creados: ' . count($permisos));

        // ============================================
        // CREAR ROLES
        // ============================================
        
        // 1. ADMINISTRADOR (nivel 2 - más alto después de super admin)
        $rolAdmin = Rol::create([
            'codigo' => 'ADMIN',
            'nombre' => 'Administrador',
            'descripcion' => 'Acceso total al sistema excepto super admin',
            'nivel_jerarquico' => 2,
            'puede_modificar_autorizados' => true,
            'requiere_clave_diaria' => true,
            'puede_cerrar_caja_con_diferencia' => true,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $rolAdmin->permisos()->attach(Permiso::all()->pluck('id'));
        $this->command->info('✓ Rol Administrador creado con TODOS los permisos');

        // 2. SUPERVISOR (nivel 3)
        $rolSupervisor = Rol::create([
            'codigo' => 'SUPERVISOR',
            'nombre' => 'Supervisor',
            'descripcion' => 'Supervisa operaciones, autoriza solicitudes y cierra cajas',
            'nivel_jerarquico' => 3,
            'puede_modificar_autorizados' => true,
            'requiere_clave_diaria' => true,
            'puede_cerrar_caja_con_diferencia' => true,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $permisosSupervisor = Permiso::whereIn('codigo', [
            'catalogo.clientes.ver',
            'catalogo.items.ver',
            'solicitud.ver', 'solicitud.autorizar',
            'orden.ver', 'orden.iniciar', 'orden.completar', 'orden.entregar',
            'caja.acceder', 'caja.cerrar', 'caja.cerrar_con_diferencia', 'caja.ver_historial',
            'pagos.ver', 'pagos.crear',
            'reportes.ventas', 'reportes.caja', 'reportes.clientes',
        ])->pluck('id');
        $rolSupervisor->permisos()->attach($permisosSupervisor);
        $this->command->info('✓ Rol Supervisor creado');

        // 3. GERENTE (nivel 4)
        $rolGerente = Rol::create([
            'codigo' => 'GERENTE',
            'nombre' => 'Gerente',
            'descripcion' => 'Gestiona catálogos y ve reportes',
            'nivel_jerarquico' => 4,
            'puede_modificar_autorizados' => false,
            'requiere_clave_diaria' => false,
            'puede_cerrar_caja_con_diferencia' => false,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $permisosGerente = Permiso::whereIn('codigo', [
            'catalogo.clientes.ver', 'catalogo.clientes.crear', 'catalogo.clientes.editar',
            'catalogo.items.ver', 'catalogo.items.crear', 'catalogo.items.editar',
            'catalogo.categorias.ver', 'catalogo.categorias.crear', 'catalogo.categorias.editar',
            'solicitud.ver', 'orden.ver',
            'reportes.ventas', 'reportes.caja', 'reportes.clientes',
        ])->pluck('id');
        $rolGerente->permisos()->attach($permisosGerente);
        $this->command->info('✓ Rol Gerente creado');

        // 4. CAJERO (nivel 5)
        $rolCajero = Rol::create([
            'codigo' => 'CAJERO',
            'nombre' => 'Cajero',
            'descripcion' => 'Maneja caja y registra pagos',
            'nivel_jerarquico' => 5,
            'puede_modificar_autorizados' => false,
            'requiere_clave_diaria' => false,
            'puede_cerrar_caja_con_diferencia' => false,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $permisosCajero = Permiso::whereIn('codigo', [
            'catalogo.clientes.ver',
            'caja.acceder', 'caja.abrir', 'caja.cerrar',
            'pagos.ver', 'pagos.crear',
        ])->pluck('id');
        $rolCajero->permisos()->attach($permisosCajero);
        $this->command->info('✓ Rol Cajero creado');

        // 5. TÉCNICO (nivel 6)
        $rolTecnico = Rol::create([
            'codigo' => 'TECNICO',
            'nombre' => 'Técnico',
            'descripcion' => 'Ejecuta órdenes de servicio',
            'nivel_jerarquico' => 6,
            'puede_modificar_autorizados' => false,
            'requiere_clave_diaria' => false,
            'puede_cerrar_caja_con_diferencia' => false,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $permisosTecnico = Permiso::whereIn('codigo', [
            'catalogo.clientes.ver',
            'orden.ver', 'orden.iniciar', 'orden.completar',
        ])->pluck('id');
        $rolTecnico->permisos()->attach($permisosTecnico);
        $this->command->info('✓ Rol Técnico creado');

        // 6. VENDEDOR (nivel 7)
        $rolVendedor = Rol::create([
            'codigo' => 'VENDEDOR',
            'nombre' => 'Vendedor',
            'descripcion' => 'Crea solicitudes y gestiona clientes',
            'nivel_jerarquico' => 7,
            'puede_modificar_autorizados' => false,
            'requiere_clave_diaria' => false,
            'puede_cerrar_caja_con_diferencia' => false,
            'activo' => true,
            'es_sistema' => true,
        ]);
        $permisosVendedor = Permiso::whereIn('codigo', [
            'catalogo.clientes.ver', 'catalogo.clientes.crear', 'catalogo.clientes.editar',
            'catalogo.items.ver',
            'solicitud.ver', 'solicitud.crear', 'solicitud.editar',
        ])->pluck('id');
        $rolVendedor->permisos()->attach($permisosVendedor);
        $this->command->info('✓ Rol Vendedor creado');

        $this->command->info('');
        $this->command->info('==============================================');
        $this->command->info('✓ Seeders completado: Roles y Permisos');
        $this->command->info('==============================================');
        $this->command->info('Total Permisos: ' . Permiso::count());
        $this->command->info('Total Roles: ' . Rol::count());
    }
}

