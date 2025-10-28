import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Empresa {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface Cliente {
  razon_social: string;
  nit?: string;
  documento?: string;
}

interface OrdenServicio {
  numero: string;
  descripcion: string;
  total: number;
}

interface FormaPago {
  nombre: string;
  codigo: string;
}

interface Usuario {
  name: string;
}

interface Pago {
  id: number;
  numero: string;
  monto: number;
  referencia?: string;
  fecha_pago: string;
  observaciones?: string;
  created_at: string;
  forma_pago: FormaPago;
  orden_servicio: OrdenServicio & { cliente: Cliente };
  usuario: Usuario;
}

interface Props {
  pago: Pago;
  empresa: Empresa;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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

function numeroALetras(numero: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (numero === 0) return 'CERO';
  if (numero === 100) return 'CIEN';

  let letras = '';
  const partes = numero.toFixed(2).split('.');
  const entero = parseInt(partes[0]);
  const decimal = parseInt(partes[1]);

  // Procesar miles
  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;

  if (miles > 0) {
    if (miles === 1) {
      letras += 'MIL ';
    } else {
      letras += unidades[miles] + ' MIL ';
    }
  }

  // Procesar centenas
  const cen = Math.floor(resto / 100);
  const dec = resto % 100;

  if (cen > 0) {
    letras += centenas[cen] + ' ';
  }

  // Procesar decenas y unidades
  if (dec >= 10 && dec < 20) {
    letras += especiales[dec - 10] + ' ';
  } else {
    const d = Math.floor(dec / 10);
    const u = dec % 10;
    
    if (d > 0) {
      letras += decenas[d] + ' ';
    }
    if (u > 0) {
      if (d > 0) letras += 'Y ';
      letras += unidades[u] + ' ';
    }
  }

  letras += `QUETZALES CON ${decimal.toString().padStart(2, '0')}/100`;

  return letras.trim();
}

export default function Show({ pago, empresa }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Recibo ${pago.numero}`} />
      
      {/* Botones (no se imprimen) */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.visit(route('transacciones.pagos.index'))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Recibo (se imprime) */}
      <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
        <Card className="max-w-3xl mx-auto bg-white print:shadow-none print:border-0">
          <div className="p-8 print:p-12">
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-8">
              {/* Logo e info empresa */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{empresa.nombre}</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>NIT: {empresa.nit}</p>
                  <p>{empresa.direccion}</p>
                  <p>Tel: {empresa.telefono}</p>
                  <p>Email: {empresa.email}</p>
                </div>
              </div>

              {/* Info recibo */}
              <div className="text-right">
                <div className="bg-green-600 text-white px-6 py-2 rounded-lg mb-3">
                  <h2 className="text-2xl font-bold">RECIBO</h2>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-lg">{pago.numero}</p>
                  <p className="text-gray-600">Fecha: {formatDate(pago.fecha_pago)}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Datos del Cliente */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Recibido de:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{pago.orden_servicio.cliente.razon_social}</p>
                {(pago.orden_servicio.cliente.nit || pago.orden_servicio.cliente.documento) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {pago.orden_servicio.cliente.nit ? `NIT: ${pago.orden_servicio.cliente.nit}` : `Documento: ${pago.orden_servicio.cliente.documento}`}
                  </p>
                )}
              </div>
            </div>

            {/* Concepto */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Concepto:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">
                  Pago correspondiente a la Orden de Servicio <span className="font-semibold">{pago.orden_servicio.numero}</span>
                </p>
                {pago.orden_servicio.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{pago.orden_servicio.descripcion}</p>
                )}
              </div>
            </div>

            {/* Detalles del Pago */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detalles del Pago:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Forma de Pago</p>
                  <p className="text-lg font-semibold text-gray-900">{pago.forma_pago.nombre}</p>
                </div>
                {pago.referencia && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Referencia / Autorización</p>
                    <p className="text-lg font-semibold text-gray-900">{pago.referencia}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Monto */}
            <div className="mb-8">
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-gray-700">Monto Recibido:</span>
                  <span className="text-4xl font-bold text-green-600">{formatMoney(pago.monto)}</span>
                </div>
                <div className="text-right">
                  <CheckCircle className="inline-block h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Pago Recibido</span>
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-gray-600 italic">
                <p>({numeroALetras(pago.monto)})</p>
              </div>
            </div>

            {/* Observaciones */}
            {pago.observaciones && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Observaciones:</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{pago.observaciones}</p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Pie */}
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p className="text-lg font-semibold text-green-600">¡Gracias por su pago!</p>
              <p>Recibo generado el {formatDateTime(pago.created_at)}</p>
              <p>Atendido por: {pago.usuario.name}</p>
            </div>

            {/* Línea de firma */}
            <div className="mt-12 pt-8">
              <div className="border-t-2 border-gray-300 w-64 mx-auto mb-2"></div>
              <p className="text-center text-sm text-gray-600">Firma Autorizada</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>
    </>
  );
}
