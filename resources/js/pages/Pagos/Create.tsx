import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrdenServicio {
  id: number;
  numero: string;
  cliente: {
    id: number;
    razon_social: string;
  };
  total: number;
  saldo_pendiente: number;
}

interface FormaPago {
  id: number;
  nombre: string;
  codigo: string;
  requiere_referencia: boolean;
  requiere_autorizacion: boolean;
  activo: boolean;
}

interface Props {
  ordenesPendientes: OrdenServicio[];
  formasPago: FormaPago[];
}

interface FormData {
  orden_servicio_id: string;
  forma_pago_id: string;
  monto: string;
  referencia: string;
  fecha_pago: string;
  observaciones: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
}

export default function Create({ ordenesPendientes, formasPago }: Props) {
  const [selectedOrden, setSelectedOrden] = useState<OrdenServicio | null>(null);
  const [selectedFormaPago, setSelectedFormaPago] = useState<FormaPago | null>(null);
  const [saldoRestante, setSaldoRestante] = useState(0);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    orden_servicio_id: '',
    forma_pago_id: '',
    monto: '',
    referencia: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  // Actualizar orden seleccionada
  useEffect(() => {
    if (data.orden_servicio_id) {
      const orden = ordenesPendientes.find(o => o.id.toString() === data.orden_servicio_id);
      setSelectedOrden(orden || null);
      // Establecer el monto por defecto al saldo pendiente
      if (orden && !data.monto) {
        setData('monto', orden.saldo_pendiente.toFixed(2));
      }
    } else {
      setSelectedOrden(null);
    }
  }, [data.orden_servicio_id]);

  // Actualizar forma de pago seleccionada
  useEffect(() => {
    if (data.forma_pago_id) {
      const forma = formasPago.find(f => f.id.toString() === data.forma_pago_id);
      setSelectedFormaPago(forma || null);
    } else {
      setSelectedFormaPago(null);
    }
  }, [data.forma_pago_id]);

  // Calcular saldo restante
  useEffect(() => {
    if (selectedOrden && data.monto) {
      const monto = parseFloat(data.monto) || 0;
      setSaldoRestante(selectedOrden.saldo_pendiente - monto);
    } else {
      setSaldoRestante(0);
    }
  }, [selectedOrden, data.monto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('transacciones.pagos.store'), {
      onSuccess: () => {
        // Redirigirá al recibo automáticamente desde el backend
      },
    });
  };

  const montoValido = selectedOrden && data.monto 
    ? parseFloat(data.monto) > 0 && parseFloat(data.monto) <= selectedOrden.saldo_pendiente
    : false;

  return (
    <CrudLayout
      title="Registrar Pago"
      description="Registra un pago recibido de un cliente"
    >
      <Head title="Registrar Pago" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Alerta informativa */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Solo se muestran órdenes con saldo pendiente. El monto del pago no puede exceder el saldo pendiente.
          </AlertDescription>
        </Alert>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Información del Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Orden de Servicio */}
              <div>
                <Label htmlFor="orden_servicio_id">
                  Orden de Servicio <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.orden_servicio_id}
                  onValueChange={(value) => {
                    setData('orden_servicio_id', value);
                    setData('monto', ''); // Resetear monto al cambiar orden
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona una orden..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ordenesPendientes.map((orden) => (
                      <SelectItem key={orden.id} value={orden.id.toString()}>
                        {orden.numero} - {orden.cliente.razon_social} (Pendiente: {formatMoney(orden.saldo_pendiente)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.orden_servicio_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.orden_servicio_id}</p>
                )}
              </div>

              {/* Información de la Orden */}
              {selectedOrden && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-blue-900">Cliente:</label>
                        <p className="text-blue-700">{selectedOrden.cliente.razon_social}</p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Número Orden:</label>
                        <p className="text-blue-700">{selectedOrden.numero}</p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Total Orden:</label>
                        <p className="text-lg font-bold text-blue-900">{formatMoney(selectedOrden.total)}</p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Saldo Pendiente:</label>
                        <p className="text-lg font-bold text-orange-600">{formatMoney(selectedOrden.saldo_pendiente)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Forma de Pago */}
              <div>
                <Label htmlFor="forma_pago_id">
                  Forma de Pago <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.forma_pago_id}
                  onValueChange={(value) => setData('forma_pago_id', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona forma de pago..." />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPago.filter(f => f.activo).map((forma) => (
                      <SelectItem key={forma.id} value={forma.id.toString()}>
                        {forma.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.forma_pago_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.forma_pago_id}</p>
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
                    max={selectedOrden?.saldo_pendiente}
                    value={data.monto}
                    onChange={(e) => setData('monto', e.target.value)}
                    className="pl-8 text-lg font-semibold"
                    placeholder="0.00"
                    disabled={!selectedOrden}
                  />
                </div>
                {errors.monto && (
                  <p className="text-sm text-red-600 mt-1">{errors.monto}</p>
                )}
                {selectedOrden && data.monto && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Máximo: {formatMoney(selectedOrden.saldo_pendiente)}
                    </p>
                    {saldoRestante !== 0 && (
                      <p className={`text-sm font-medium ${saldoRestante < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Saldo restante: {formatMoney(Math.abs(saldoRestante))}
                        {saldoRestante === 0 && ' ✓ Orden quedará completamente pagada'}
                      </p>
                    )}
                    {saldoRestante === 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Pago completo - Orden será marcada como pagada</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Referencia (condicional) */}
              {selectedFormaPago?.requiere_referencia && (
                <div>
                  <Label htmlFor="referencia">
                    Referencia / Autorización <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="referencia"
                    value={data.referencia}
                    onChange={(e) => setData('referencia', e.target.value)}
                    className="mt-2"
                    placeholder="Ej: Número de cheque, autorización de tarjeta..."
                  />
                  {errors.referencia && (
                    <p className="text-sm text-red-600 mt-1">{errors.referencia}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Requerido para {selectedFormaPago.nombre}
                  </p>
                </div>
              )}

              {/* Fecha de Pago */}
              <div>
                <Label htmlFor="fecha_pago">
                  Fecha de Pago <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_pago"
                  type="date"
                  value={data.fecha_pago}
                  onChange={(e) => setData('fecha_pago', e.target.value)}
                  className="mt-2"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.fecha_pago && (
                  <p className="text-sm text-red-600 mt-1">{errors.fecha_pago}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  No se permiten fechas futuras
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
                  placeholder="Notas adicionales sobre el pago..."
                />
                {errors.observaciones && (
                  <p className="text-sm text-red-600 mt-1">{errors.observaciones}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit(route('transacciones.pagos.index'))}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={processing || !montoValido || !data.forma_pago_id || (selectedFormaPago?.requiere_referencia && !data.referencia)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? 'Registrando...' : 'Registrar Pago'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CrudLayout>
  );
}
