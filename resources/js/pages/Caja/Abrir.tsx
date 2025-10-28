import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Caja {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

interface Props {
  cajas: Caja[];
}

interface FormData {
  caja_id: string;
  monto_inicial: string;
  observaciones: string;
}

export default function Abrir({ cajas }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    caja_id: '',
    monto_inicial: '0.00',
    observaciones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('transacciones.caja.abrir'));
  };

  return (
    <CrudLayout
      title="Abrir Caja"
      description="Registra la apertura de caja para iniciar las operaciones del día"
    >
      <Head title="Abrir Caja" />

      <div className="max-w-2xl mx-auto">
        {/* Card de Alerta */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Importante</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Asegúrate de contar el efectivo inicial correctamente. Este monto se usará como base
                  para el arqueo al cierre de caja.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Datos de Apertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Caja */}
              <div>
                <Label htmlFor="caja_id">
                  Caja <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.caja_id}
                  onValueChange={(value) => setData('caja_id', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona una caja" />
                  </SelectTrigger>
                  <SelectContent>
                    {cajas.map((caja) => (
                      <SelectItem key={caja.id} value={caja.id.toString()}>
                        {caja.nombre}
                        {caja.descripcion && (
                          <span className="text-sm text-muted-foreground ml-2">
                            - {caja.descripcion}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.caja_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.caja_id}</p>
                )}
              </div>

              {/* Fecha y Hora Actual */}
              <div>
                <Label>Fecha y Hora de Apertura</Label>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {/* Monto Inicial */}
              <div>
                <Label htmlFor="monto_inicial">
                  Monto Inicial en Efectivo <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Q</span>
                  </div>
                  <Input
                    id="monto_inicial"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.monto_inicial}
                    onChange={(e) => setData('monto_inicial', e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.monto_inicial && (
                  <p className="text-sm text-red-600 mt-1">{errors.monto_inicial}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Ingresa el monto con el que iniciarás las operaciones de caja
                </p>
              </div>

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones">
                  Observaciones <span className="text-muted-foreground">(Opcional)</span>
                </Label>
                <Textarea
                  id="observaciones"
                  value={data.observaciones}
                  onChange={(e) => setData('observaciones', e.target.value)}
                  rows={3}
                  className="mt-2"
                  placeholder="Ej: Billetes de Q100: 10, Billetes de Q50: 5..."
                />
                {errors.observaciones && (
                  <p className="text-sm text-red-600 mt-1">{errors.observaciones}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Puedes agregar detalles sobre la denominación de billetes o monedas
                </p>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit(route('transacciones.caja.index'))}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? 'Abriendo...' : 'Abrir Caja'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card de Ayuda */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">¿Qué sucede al abrir la caja?</h4>
                <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Se registra la fecha y hora de apertura</li>
                  <li>Se asigna la caja a tu usuario</li>
                  <li>Puedes realizar movimientos (ingresos/egresos)</li>
                  <li>Solo puedes tener una caja abierta a la vez</li>
                  <li>Al finalizar el día, deberás cerrar la caja con el arqueo correspondiente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CrudLayout>
  );
}
