<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Controllers
use App\Http\Controllers\Config\ConfiguracionEmpresaController;
use App\Http\Controllers\Config\RolController;
use App\Http\Controllers\Config\PermisoController;
use App\Http\Controllers\Config\UsuarioController;
use App\Http\Controllers\Config\CajaController;
use App\Http\Controllers\Catalogo\ClienteController;
use App\Http\Controllers\Catalogo\ItemController;
use App\Http\Controllers\Catalogo\CategoriaItemController;
use App\Http\Controllers\Documento\SolicitudController;
use App\Http\Controllers\Documento\OrdenServicioController;
use App\Http\Controllers\Transaccion\PagoController;
use App\Http\Controllers\Transaccion\CajaController as CajaTransaccionController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ========================================
    // MÓDULO CONFIGURACIÓN
    // ========================================
    Route::prefix('config')->name('config.')->group(function () {
        
        // Configuración Empresa
        Route::get('empresa', [ConfiguracionEmpresaController::class, 'edit'])->name('empresa.edit');
        Route::put('empresa', [ConfiguracionEmpresaController::class, 'update'])->name('empresa.update');
        
        // Roles
        Route::resource('roles', RolController::class);
        
        // Permisos
        Route::get('permisos', [PermisoController::class, 'index'])->name('permisos.index');
        
        // Usuarios
        Route::resource('usuarios', UsuarioController::class);
        Route::post('usuarios/{usuario}/toggle-status', [UsuarioController::class, 'toggleStatus'])
            ->name('usuarios.toggle-status');
        
        // Cajas
        Route::resource('cajas', CajaController::class);
    });

    // ========================================
    // MÓDULO CATÁLOGOS
    // ========================================
    Route::prefix('catalogo')->name('catalogo.')->group(function () {
        
        // Clientes
        Route::resource('clientes', ClienteController::class);
        
        // Categorías de Items
        Route::resource('categorias', CategoriaItemController::class);
        
        // Items (Productos/Servicios)
        Route::resource('items', ItemController::class);
        Route::post('items/{item}/ajustar-stock', [ItemController::class, 'ajustarStock'])
            ->name('items.ajustar-stock');
    });

    // ========================================
    // MÓDULO DOCUMENTOS
    // ========================================
    Route::prefix('documentos')->name('documentos.')->group(function () {
        
        // Solicitudes
        Route::resource('solicitudes', SolicitudController::class);
        Route::post('solicitudes/{solicitud}/autorizar', [SolicitudController::class, 'autorizar'])
            ->name('solicitudes.autorizar');
        Route::post('solicitudes/{solicitud}/rechazar', [SolicitudController::class, 'rechazar'])
            ->name('solicitudes.rechazar');
        
        // Órdenes de Servicio
        Route::resource('ordenes', OrdenServicioController::class);
        Route::post('ordenes/{orden}/iniciar', [OrdenServicioController::class, 'iniciar'])
            ->name('ordenes.iniciar');
        Route::post('ordenes/{orden}/completar', [OrdenServicioController::class, 'completar'])
            ->name('ordenes.completar');
        Route::post('ordenes/{orden}/entregar', [OrdenServicioController::class, 'entregar'])
            ->name('ordenes.entregar');
    });

    // ========================================
    // MÓDULO TRANSACCIONES
    // ========================================
    Route::prefix('transacciones')->name('transacciones.')->group(function () {
        
        // Pagos
        Route::resource('pagos', PagoController::class)->except(['edit', 'update', 'destroy']);
        
        // Caja (Apertura/Cierre)
        Route::get('caja/actual', [CajaTransaccionController::class, 'actual'])->name('caja.actual');
        Route::post('caja/abrir', [CajaTransaccionController::class, 'abrir'])->name('caja.abrir');
        Route::post('caja/cerrar', [CajaTransaccionController::class, 'cerrar'])->name('caja.cerrar');
        Route::post('caja/movimiento', [CajaTransaccionController::class, 'movimiento'])->name('caja.movimiento');
        Route::get('caja/historial', [CajaTransaccionController::class, 'historial'])->name('caja.historial');
    });
});

require __DIR__.'/settings.php';

