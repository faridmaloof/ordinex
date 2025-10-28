import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface Caja {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  name: string;
}

interface CajaTransaccion {
  id: number;
  caja: Caja;
  usuario: Usuario;
  fecha_apertura: string;
  monto_inicial: number;
  balance_actual: number;
}

interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  concepto: string;
  created_at: string;
}

interface Props {
  cajaTransaccion: CajaTransaccion;
  ultimosMovimientos: Movimiento[];
}

interface FormData {
  caja_transaccion_id: number;
  tipo: 'ingreso' | 'egreso';
  monto: string;
  concepto: string;
  referencia: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Movimiento({ cajaTransaccion, ultimosMovimientos }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    caja_transaccion_id: cajaTransaccion.id,
    tipo: 'ingreso',
    monto: '',
    concepto: '',
    referencia: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('transacciones.caja.movimiento'), {
      onSuccess: () => {
        reset('monto', 'concepto', 'referencia');
      },
    });
  };

  return (
    <CrudLayout
      title="Registrar Movimiento"
      description={`Caja: ${cajaTransaccion.caja.nombre}`}
    >
      <Head title="Registrar Movimiento" />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Card de Información de Caja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Estado Actual de Caja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Caja</label>
                <p className="text-lg font-semibold">{cajaTransaccion.caja.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cajero</label>
                <p className="text-lg font-semibold">{cajaTransaccion.usuario.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monto Inicial</label>
                <p className="text-lg font-bold text-blue-600">{formatMoney(cajaTransaccion.monto_inicial)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Balance Actual</label>
                <p className="text-2xl font-bold text-green-600">{formatMoney(cajaTransaccion.balance_actual)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Abierta desde: {formatDateTime(cajaTransaccion.fecha_apertura)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Registro */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Movimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de Movimiento */}
                  <div>
                    <Label className="mb-3 block">
                      Tipo de Movimiento <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={data.tipo}
                      onValueChange={(value: 'ingreso' | 'egreso') => setData('tipo', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="relative flex items-center space-x-2 border-2 border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors cursor-pointer has-[:checked]:border-green-600 has-[:checked]:bg-green-50">
                          <RadioGroupItem value="ingreso" id="ingreso" />
                          <Label htmlFor="ingreso" className="flex items-center gap-2 cursor-pointer flex-1">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-900">Ingreso</p>
                              <p className="text-xs text-green-700">Aumenta el saldo</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="relative flex items-center space-x-2 border-2 border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors cursor-pointer has-[:checked]:border-red-600 has-[:checked]:bg-red-50">
                          <RadioGroupItem value="egreso" id="egreso" />
                          <Label htmlFor="egreso" className="flex items-center gap-2 cursor-pointer flex-1">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-semibold text-red-900">Egreso</p>
                              <p className="text-xs text-red-700">Disminuye el saldo</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {errors.tipo && (
                      <p className="text-sm text-red-600 mt-2">{errors.tipo}</p>
                    )}
                  </div>

                  {/* Monto */}
                  <div>
                    <Label htmlFor="monto">
                      Monto <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Q</span>
                      </div>
                      <Input
                        id="monto"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.monto}
                        onChange={(e) => setData('monto', e.target.value)}
                        className="pl-8 text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.monto && (
                      <p className="text-sm text-red-600 mt-1">{errors.monto}</p>
                    )}
                  </div>

                  {/* Concepto */}
                  <div>
                    <Label htmlFor="concepto">
                      Concepto <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="concepto"
                      value={data.concepto}
                      onChange={(e) => setData('concepto', e.target.value)}
                      rows={3}
                      className="mt-2"
                      placeholder="Describe el motivo del movimiento (mínimo 10 caracteres)..."
                    />
                    {errors.concepto && (
                      <p className="text-sm text-red-600 mt-1">{errors.concepto}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.concepto.length}/10 caracteres mínimos
                    </p>
                  </div>

                  {/* Referencia */}
                  <div>
                    <Label htmlFor="referencia">
                      Referencia <span className="text-muted-foreground">(Opcional)</span>
                    </Label>
                    <Input
                      id="referencia"
                      value={data.referencia}
                      onChange={(e) => setData('referencia', e.target.value)}
                      className="mt-2"
                      placeholder="Ej: Factura #1234, Recibo #5678..."
                    />
                    {errors.referencia && (
                      <p className="text-sm text-red-600 mt-1">{errors.referencia}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Número de factura, recibo u otro documento relacionado
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.visit(route('transacciones.caja.actual'))}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing || !data.monto || data.concepto.length < 10}
                      className={data.tipo === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                      {processing ? 'Registrando...' : `Registrar ${data.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Últimos Movimientos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                {ultimosMovimientos.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No hay movimientos registrados aún
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ultimosMovimientos.map((movimiento) => (
                      <div
                        key={movimiento.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge
                            variant={movimiento.tipo === 'ingreso' ? 'default' : 'destructive'}
                            className={movimiento.tipo === 'ingreso' ? 'bg-green-600' : ''}
                          >
                            {movimiento.tipo === 'ingreso' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {movimiento.tipo}
                          </Badge>
                          <span
                            className={`text-sm font-bold ${
                              movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {movimiento.tipo === 'ingreso' ? '+' : '-'} {formatMoney(movimiento.monto)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{movimiento.concepto}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(movimiento.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CrudLayout>
  );
}
