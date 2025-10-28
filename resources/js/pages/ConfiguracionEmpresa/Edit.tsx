import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Building2, DollarSign, GitBranch, CreditCard } from 'lucide-react';
import CrudLayout from '@/layouts/CrudLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfiguracionEmpresa {
  id: number;
  // Datos Empresa
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
  // Moneda
  moneda_codigo: string;
  moneda_simbolo: string;
  decimales: number;
  separador_miles: string;
  // Workflow
  requiere_autorizacion_solicitud: boolean;
  monto_maximo_sin_autorizacion: number;
  dias_validez_solicitud: number;
  // Anticipos
  permitir_anticipos: boolean;
  porcentaje_anticipo_minimo: number;
  porcentaje_anticipo_maximo: number;
  requiere_aprobacion_anticipos: boolean;
}

interface Props {
  configuracion: ConfiguracionEmpresa;
}

interface FormData {
  // Datos Empresa
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: File | null;
  // Moneda
  moneda_codigo: string;
  moneda_simbolo: string;
  decimales: number;
  separador_miles: string;
  // Workflow
  requiere_autorizacion_solicitud: boolean;
  monto_maximo_sin_autorizacion: string;
  dias_validez_solicitud: string;
  // Anticipos
  permitir_anticipos: boolean;
  porcentaje_anticipo_minimo: string;
  porcentaje_anticipo_maximo: string;
  requiere_aprobacion_anticipos: boolean;
}

export default function Edit({ configuracion }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    // Datos Empresa
    nombre: configuracion.nombre,
    nit: configuracion.nit,
    direccion: configuracion.direccion,
    telefono: configuracion.telefono,
    email: configuracion.email,
    logo: null,
    // Moneda
    moneda_codigo: configuracion.moneda_codigo,
    moneda_simbolo: configuracion.moneda_simbolo,
    decimales: configuracion.decimales,
    separador_miles: configuracion.separador_miles,
    // Workflow
    requiere_autorizacion_solicitud: configuracion.requiere_autorizacion_solicitud,
    monto_maximo_sin_autorizacion: configuracion.monto_maximo_sin_autorizacion.toString(),
    dias_validez_solicitud: configuracion.dias_validez_solicitud.toString(),
    // Anticipos
    permitir_anticipos: configuracion.permitir_anticipos,
    porcentaje_anticipo_minimo: configuracion.porcentaje_anticipo_minimo.toString(),
    porcentaje_anticipo_maximo: configuracion.porcentaje_anticipo_maximo.toString(),
    requiere_aprobacion_anticipos: configuracion.requiere_aprobacion_anticipos,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('config.empresa.update', configuracion.id), {
      forceFormData: true,
      onSuccess: () => {
        // Resetear el input de logo
        setData('logo', null);
      },
    });
  };

  const handleReset = () => {
    reset();
  };

  // Validación de porcentajes de anticipo
  const porcentajesMinimoValido = parseFloat(data.porcentaje_anticipo_minimo) >= 0 && parseFloat(data.porcentaje_anticipo_minimo) <= 100;
  const porcentajesMaximoValido = parseFloat(data.porcentaje_anticipo_maximo) >= 0 && parseFloat(data.porcentaje_anticipo_maximo) <= 100;
  const porcentajesValidos = porcentajesMinimoValido && porcentajesMaximoValido && 
    parseFloat(data.porcentaje_anticipo_minimo) < parseFloat(data.porcentaje_anticipo_maximo);

  return (
    <CrudLayout
      title="Configuración de Empresa"
      description="Configura los datos generales de tu empresa"
    >
      <Head title="Configuración de Empresa" />

      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="empresa" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="empresa" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Datos Empresa
                  </TabsTrigger>
                  <TabsTrigger value="moneda" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Moneda
                  </TabsTrigger>
                  <TabsTrigger value="workflow" className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Workflow
                  </TabsTrigger>
                  <TabsTrigger value="anticipos" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Anticipos
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Datos Empresa */}
                <TabsContent value="empresa" className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Información de la Empresa</CardTitle>
                    <CardDescription>
                      Configura los datos básicos de tu empresa que aparecerán en documentos y recibos
                    </CardDescription>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="col-span-2">
                      <Label htmlFor="nombre">
                        Nombre de la Empresa <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="mt-2"
                        placeholder="Ej: Mi Empresa S.A."
                      />
                      {errors.nombre && (
                        <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>
                      )}
                    </div>

                    {/* NIT */}
                    <div>
                      <Label htmlFor="nit">
                        NIT <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nit"
                        value={data.nit}
                        onChange={(e) => setData('nit', e.target.value)}
                        className="mt-2"
                        placeholder="1234567-8"
                      />
                      {errors.nit && (
                        <p className="text-sm text-red-600 mt-1">{errors.nit}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Formato: 1234567-8
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <Label htmlFor="telefono">
                        Teléfono <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="telefono"
                        value={data.telefono}
                        onChange={(e) => setData('telefono', e.target.value)}
                        className="mt-2"
                        placeholder="(502) 1234-5678"
                      />
                      {errors.telefono && (
                        <p className="text-sm text-red-600 mt-1">{errors.telefono}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-2"
                        placeholder="contacto@miempresa.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Dirección */}
                    <div className="col-span-2">
                      <Label htmlFor="direccion">
                        Dirección <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="direccion"
                        value={data.direccion}
                        onChange={(e) => setData('direccion', e.target.value)}
                        rows={2}
                        className="mt-2"
                        placeholder="Dirección completa de la empresa..."
                      />
                      {errors.direccion && (
                        <p className="text-sm text-red-600 mt-1">{errors.direccion}</p>
                      )}
                    </div>

                    {/* Logo */}
                    <div className="col-span-2">
                      <Label htmlFor="logo">
                        Logo <span className="text-muted-foreground">(Opcional)</span>
                      </Label>
                      <div className="mt-2 flex items-start gap-4">
                        {configuracion.logo && (
                          <div className="flex-shrink-0">
                            <img
                              src={configuracion.logo}
                              alt="Logo actual"
                              className="h-20 w-20 object-contain border rounded"
                            />
                            <p className="text-xs text-muted-foreground text-center mt-1">Logo actual</p>
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {errors.logo && (
                            <p className="text-sm text-red-600 mt-1">{errors.logo}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Formatos permitidos: JPG, PNG, SVG. Máximo 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Moneda */}
                <TabsContent value="moneda" className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Configuración de Moneda</CardTitle>
                    <CardDescription>
                      Define el formato de moneda que se utilizará en todo el sistema
                    </CardDescription>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Código Moneda */}
                    <div>
                      <Label htmlFor="moneda_codigo">
                        Código de Moneda <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="moneda_codigo"
                        value={data.moneda_codigo}
                        onChange={(e) => setData('moneda_codigo', e.target.value.toUpperCase())}
                        className="mt-2"
                        placeholder="GTQ"
                        maxLength={3}
                      />
                      {errors.moneda_codigo && (
                        <p className="text-sm text-red-600 mt-1">{errors.moneda_codigo}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Código ISO de 3 letras (ej: GTQ, USD, EUR)
                      </p>
                    </div>

                    {/* Símbolo Moneda */}
                    <div>
                      <Label htmlFor="moneda_simbolo">
                        Símbolo de Moneda <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="moneda_simbolo"
                        value={data.moneda_simbolo}
                        onChange={(e) => setData('moneda_simbolo', e.target.value)}
                        className="mt-2"
                        placeholder="Q"
                        maxLength={3}
                      />
                      {errors.moneda_simbolo && (
                        <p className="text-sm text-red-600 mt-1">{errors.moneda_simbolo}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Símbolo que se mostrará (ej: Q, $, €)
                      </p>
                    </div>

                    {/* Decimales */}
                    <div>
                      <Label htmlFor="decimales">
                        Decimales <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decimales"
                        type="number"
                        min="0"
                        max="4"
                        value={data.decimales}
                        onChange={(e) => setData('decimales', parseInt(e.target.value))}
                        className="mt-2"
                      />
                      {errors.decimales && (
                        <p className="text-sm text-red-600 mt-1">{errors.decimales}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Número de decimales (0-4)
                      </p>
                    </div>

                    {/* Separador Miles */}
                    <div>
                      <Label htmlFor="separador_miles">
                        Separador de Miles <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={data.separador_miles}
                        onValueChange={(value) => setData('separador_miles', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=",">,  (coma)</SelectItem>
                          <SelectItem value=".">. (punto)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.separador_miles && (
                        <p className="text-sm text-red-600 mt-1">{errors.separador_miles}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Ejemplo con coma: 1,000.00 | con punto: 1.000,00
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="col-span-2 mt-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-blue-900 mb-2 font-medium">Vista previa:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {data.moneda_simbolo} 1{data.separador_miles}234
                            {data.decimales > 0 && `.${Array(data.decimales).fill('0').join('')}`}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Workflow */}
                <TabsContent value="workflow" className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Configuración de Workflow</CardTitle>
                    <CardDescription>
                      Configura las reglas de autorización para solicitudes y órdenes
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-6">
                    {/* Requiere Autorización */}
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="requiere_autorizacion_solicitud"
                        checked={data.requiere_autorizacion_solicitud}
                        onCheckedChange={(checked) => 
                          setData('requiere_autorizacion_solicitud', checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="requiere_autorizacion_solicitud"
                          className="font-medium cursor-pointer"
                        >
                          Requiere autorización para solicitudes
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Las solicitudes que excedan el monto configurado requerirán autorización
                        </p>
                      </div>
                    </div>

                    {/* Monto Máximo Sin Autorización */}
                    <div>
                      <Label htmlFor="monto_maximo_sin_autorizacion">
                        Monto Máximo Sin Autorización <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">Q</span>
                        </div>
                        <Input
                          id="monto_maximo_sin_autorizacion"
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.monto_maximo_sin_autorizacion}
                          onChange={(e) => setData('monto_maximo_sin_autorizacion', e.target.value)}
                          className="pl-8"
                          placeholder="0.00"
                          disabled={!data.requiere_autorizacion_solicitud}
                        />
                      </div>
                      {errors.monto_maximo_sin_autorizacion && (
                        <p className="text-sm text-red-600 mt-1">{errors.monto_maximo_sin_autorizacion}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Solicitudes con monto mayor a este valor requerirán autorización
                      </p>
                    </div>

                    {/* Días Validez Solicitud */}
                    <div>
                      <Label htmlFor="dias_validez_solicitud">
                        Días de Validez de Solicitud Autorizada <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dias_validez_solicitud"
                        type="number"
                        min="1"
                        max="365"
                        value={data.dias_validez_solicitud}
                        onChange={(e) => setData('dias_validez_solicitud', e.target.value)}
                        className="mt-2"
                        placeholder="30"
                      />
                      {errors.dias_validez_solicitud && (
                        <p className="text-sm text-red-600 mt-1">{errors.dias_validez_solicitud}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Días que una solicitud autorizada permanece válida antes de expirar
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Anticipos */}
                <TabsContent value="anticipos" className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Configuración de Anticipos</CardTitle>
                    <CardDescription>
                      Configura las reglas para pagos anticipados en órdenes
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-6">
                    {/* Permitir Anticipos */}
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="permitir_anticipos"
                        checked={data.permitir_anticipos}
                        onCheckedChange={(checked) => 
                          setData('permitir_anticipos', checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="permitir_anticipos"
                          className="font-medium cursor-pointer"
                        >
                          Permitir anticipos en órdenes
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Habilita la opción de solicitar pagos anticipados a los clientes
                        </p>
                      </div>
                    </div>

                    {/* Porcentaje Mínimo */}
                    <div>
                      <Label htmlFor="porcentaje_anticipo_minimo">
                        Porcentaje Mínimo de Anticipo <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="porcentaje_anticipo_minimo"
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={data.porcentaje_anticipo_minimo}
                          onChange={(e) => setData('porcentaje_anticipo_minimo', e.target.value)}
                          className="pr-8"
                          placeholder="0"
                          disabled={!data.permitir_anticipos}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                      {errors.porcentaje_anticipo_minimo && (
                        <p className="text-sm text-red-600 mt-1">{errors.porcentaje_anticipo_minimo}</p>
                      )}
                      {!porcentajesMinimoValido && (
                        <p className="text-sm text-red-600 mt-1">El porcentaje debe estar entre 0 y 100</p>
                      )}
                    </div>

                    {/* Porcentaje Máximo */}
                    <div>
                      <Label htmlFor="porcentaje_anticipo_maximo">
                        Porcentaje Máximo de Anticipo <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="porcentaje_anticipo_maximo"
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={data.porcentaje_anticipo_maximo}
                          onChange={(e) => setData('porcentaje_anticipo_maximo', e.target.value)}
                          className="pr-8"
                          placeholder="100"
                          disabled={!data.permitir_anticipos}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                      {errors.porcentaje_anticipo_maximo && (
                        <p className="text-sm text-red-600 mt-1">{errors.porcentaje_anticipo_maximo}</p>
                      )}
                      {!porcentajesMaximoValido && (
                        <p className="text-sm text-red-600 mt-1">El porcentaje debe estar entre 0 y 100</p>
                      )}
                      {!porcentajesValidos && porcentajesMinimoValido && porcentajesMaximoValido && (
                        <p className="text-sm text-red-600 mt-1">
                          El porcentaje máximo debe ser mayor que el mínimo
                        </p>
                      )}
                    </div>

                    {/* Requiere Aprobación */}
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="requiere_aprobacion_anticipos"
                        checked={data.requiere_aprobacion_anticipos}
                        onCheckedChange={(checked) => 
                          setData('requiere_aprobacion_anticipos', checked as boolean)
                        }
                        disabled={!data.permitir_anticipos}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="requiere_aprobacion_anticipos"
                          className="font-medium cursor-pointer"
                        >
                          Requiere aprobación para anticipos
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Los anticipos solicitados requerirán aprobación de un supervisor
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botones de acción (fuera de tabs, siempre visibles) */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={processing}
                >
                  Descartar Cambios
                </Button>
                <Button
                  type="submit"
                  disabled={processing || !porcentajesValidos}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CrudLayout>
  );
}
