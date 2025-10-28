import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Calculator, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  observaciones_apertura?: string;
}

interface Resumen {
  monto_inicial: number;
  ingresos: number;
  egresos: number;
  efectivo_esperado: number;
}

interface Props {
  cajaTransaccion: CajaTransaccion;
  resumen: Resumen;
}

interface FormData {
  caja_transaccion_id: number;
  monto_final_real: string;
  observaciones: string;
  supervisor_id?: string;
  clave_diaria?: string;
  justificacion?: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
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

export default function Cerrar({ cajaTransaccion, resumen }: Props) {
  const [diferencia, setDiferencia] = useState(0);
  const [showDiferenciaModal, setShowDiferenciaModal] = useState(false);
  const [claveDiaria, setClaveDiaria] = useState('');
  const [justificacion, setJustificacion] = useState('');

  const { data, setData, post, processing, errors } = useForm<FormData>({
    caja_transaccion_id: cajaTransaccion.id,
    monto_final_real: resumen.efectivo_esperado.toFixed(2),
    observaciones: '',
  });

  // Calcular diferencia cuando cambia el monto real
  useEffect(() => {
    const montoReal = parseFloat(data.monto_final_real) || 0;
    const diff = montoReal - resumen.efectivo_esperado;
    setDiferencia(diff);
  }, [data.monto_final_real, resumen.efectivo_esperado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si hay diferencia, mostrar modal de autorización
    if (Math.abs(diferencia) > 0.01) {
      setShowDiferenciaModal(true);
    } else {
      // Si no hay diferencia, cerrar directamente
      post(route('transacciones.caja.cerrar'));
    }
  };

  const handleCerrarConDiferencia = () => {
    if (!justificacion || justificacion.length < 10) {
      alert('La justificación debe tener al menos 10 caracteres');
      return;
    }

    if (!claveDiaria) {
      alert('Debes ingresar la clave diaria del supervisor');
      return;
    }

    // Cerrar con diferencia usando los datos actuales más los de autorización
    router.post(route('transacciones.caja.cerrar'), {
      ...data,
      clave_diaria: claveDiaria,
      justificacion: justificacion,
    }, {
      onSuccess: () => {
        setShowDiferenciaModal(false);
      },
    });
  };

  const tieneDiferencia = Math.abs(diferencia) > 0.01;

  return (
    <CrudLayout
      title="Cerrar Caja"
      description={`Caja: ${cajaTransaccion.caja.nombre}`}
    >
      <Head title="Cerrar Caja" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Card de Resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Resumen del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Caja</label>
                <p className="text-lg font-semibold">{cajaTransaccion.caja.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cajero</label>
                <p className="text-lg font-semibold">{cajaTransaccion.usuario.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha Apertura</label>
                <p className="text-sm">{formatDateTime(cajaTransaccion.fecha_apertura)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monto Inicial</label>
                <p className="text-lg font-bold text-blue-600">{formatMoney(resumen.monto_inicial)}</p>
              </div>
            </div>

            {/* Movimientos */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monto Inicial:</span>
                <span className="text-lg font-semibold">{formatMoney(resumen.monto_inicial)}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm font-medium">+ Ingresos:</span>
                <span className="text-lg font-semibold">{formatMoney(resumen.ingresos)}</span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm font-medium">- Egresos:</span>
                <span className="text-lg font-semibold">{formatMoney(resumen.egresos)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span className="text-base font-bold">Efectivo Esperado:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatMoney(resumen.efectivo_esperado)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de Cierre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Arqueo de Caja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monto Real Contado */}
              <div>
                <Label htmlFor="monto_final_real">
                  Monto Real Contado <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Q</span>
                  </div>
                  <Input
                    id="monto_final_real"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.monto_final_real}
                    onChange={(e) => setData('monto_final_real', e.target.value)}
                    className="pl-8 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
                {errors.monto_final_real && (
                  <p className="text-sm text-red-600 mt-1">{errors.monto_final_real}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Cuenta el efectivo físico en la caja y registra el monto total
                </p>
              </div>

              {/* Diferencia */}
              {Math.abs(diferencia) > 0.01 && (
                <Card className={diferencia > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {diferencia > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-medium ${diferencia > 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {diferencia > 0 ? 'Sobrante Detectado' : 'Faltante Detectado'}
                        </h4>
                        <p className={`text-sm mt-1 ${diferencia > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          Diferencia: <span className="font-bold text-lg">{formatMoney(Math.abs(diferencia))}</span>
                        </p>
                        <p className={`text-sm mt-2 ${diferencia > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          Se requerirá autorización del supervisor con clave diaria y justificación.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cuadre Perfecto */}
              {Math.abs(diferencia) <= 0.01 && parseFloat(data.monto_final_real) > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">¡Cuadre Perfecto!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          El efectivo contado coincide con el esperado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                  placeholder="Ej: Todo normal, sin novedades..."
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
                  onClick={() => router.visit(route('transacciones.caja.actual'))}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={processing || parseFloat(data.monto_final_real) < 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {processing ? 'Cerrando...' : tieneDiferencia ? 'Cerrar con Diferencia' : 'Cerrar Caja'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Diferencia */}
      <Dialog open={showDiferenciaModal} onOpenChange={setShowDiferenciaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Autorización de Supervisor Requerida
            </DialogTitle>
            <DialogDescription>
              Se detectó una diferencia de <strong>{formatMoney(Math.abs(diferencia))}</strong>.
              Se requiere la clave del supervisor y una justificación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Resumen de Diferencia */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Esperado:</span>
                  <span className="font-semibold">{formatMoney(resumen.efectivo_esperado)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contado:</span>
                  <span className="font-semibold">{formatMoney(parseFloat(data.monto_final_real) || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-300">
                  <span className="font-bold">Diferencia:</span>
                  <span className={`font-bold ${diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferencia > 0 ? '+' : ''}{formatMoney(diferencia)}
                  </span>
                </div>
              </div>
            </div>

            {/* Clave Diaria */}
            <div>
              <Label htmlFor="clave_diaria">
                Clave Diaria del Supervisor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clave_diaria"
                type="password"
                value={claveDiaria}
                onChange={(e) => setClaveDiaria(e.target.value)}
                className="mt-2"
                placeholder="Ingresa la clave diaria"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Solicita al supervisor su clave diaria para autorizar el cierre
              </p>
            </div>

            {/* Justificación */}
            <div>
              <Label htmlFor="justificacion">
                Justificación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="justificacion"
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="Explica el motivo de la diferencia (mínimo 10 caracteres)..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {justificacion.length}/10 caracteres mínimos
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiferenciaModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCerrarConDiferencia}
              disabled={processing || !claveDiaria || justificacion.length < 10}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Cerrando...' : 'Confirmar Cierre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrudLayout>
  );
}
