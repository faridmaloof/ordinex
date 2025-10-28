<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Catalogo\FormaPago;

class FormasPagoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $formasPago = [
            [
                'codigo' => 'EFECTIVO',
                'nombre' => 'Efectivo',
                'descripcion' => 'Pago en efectivo',
                'tipo' => 'efectivo',
                'requiere_referencia' => false,
                'genera_movimiento_caja' => true,
                'requiere_autorizacion' => false,
                'orden' => 1,
                'activa' => true,
            ],
            [
                'codigo' => 'TD',
                'nombre' => 'Tarjeta Débito',
                'descripcion' => 'Pago con tarjeta débito',
                'tipo' => 'tarjeta',
                'requiere_referencia' => true,
                'genera_movimiento_caja' => true,
                'requiere_autorizacion' => false,
                'orden' => 2,
                'activa' => true,
            ],
            [
                'codigo' => 'TC',
                'nombre' => 'Tarjeta Crédito',
                'descripcion' => 'Pago con tarjeta crédito',
                'tipo' => 'tarjeta',
                'requiere_referencia' => true,
                'genera_movimiento_caja' => true,
                'requiere_autorizacion' => false,
                'orden' => 3,
                'activa' => true,
            ],
            [
                'codigo' => 'TRANSFERENCIA',
                'nombre' => 'Transferencia Bancaria',
                'descripcion' => 'Pago por transferencia bancaria',
                'tipo' => 'transferencia',
                'requiere_referencia' => true,
                'genera_movimiento_caja' => false,
                'requiere_autorizacion' => false,
                'orden' => 4,
                'activa' => true,
            ],
            [
                'codigo' => 'CHEQUE',
                'nombre' => 'Cheque',
                'descripcion' => 'Pago con cheque',
                'tipo' => 'cheque',
                'requiere_referencia' => true,
                'genera_movimiento_caja' => false,
                'requiere_autorizacion' => true,
                'orden' => 5,
                'activa' => true,
            ],
            [
                'codigo' => 'CREDITO',
                'nombre' => 'Crédito',
                'descripcion' => 'Pago a crédito',
                'tipo' => 'otro',
                'requiere_referencia' => false,
                'genera_movimiento_caja' => false,
                'requiere_autorizacion' => true,
                'orden' => 6,
                'activa' => true,
            ],
        ];

        foreach ($formasPago as $forma) {
            FormaPago::create($forma);
        }

        $this->command->info('✓ Formas de Pago creadas: ' . count($formasPago));
    }
}

