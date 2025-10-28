import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { FormField } from '@/components/form-field';
import { TextareaField } from '@/components/textarea-field';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CategoriaItem {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    padre_id?: number;
    activo: boolean;
}

interface CategoriaOption {
    id: number;
    nombre: string;
    codigo: string;
}

interface Props {
    categoria: CategoriaItem;
    categorias: CategoriaOption[];
}

export default function Edit({ categoria, categorias }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: categoria.nombre,
        codigo: categoria.codigo,
        descripcion: categoria.descripcion || '',
        padre_id: categoria.padre_id?.toString() || '',
        activo: categoria.activo,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('catalogos.categorias-items.update', categoria.id));
    };

    // Filtrar la categoría actual para evitar auto-referencia
    const categoriasOptions = categorias
        .filter((cat) => cat.id !== categoria.id)
        .map((cat) => ({
            value: cat.id.toString(),
            label: `${cat.codigo} - ${cat.nombre}`,
        }));

    return (
        <AppLayout>
            <Head title={`Editar Categoría: ${categoria.nombre}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('catalogos.categorias-items.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Categoría</h1>
                        <p className="text-muted-foreground">{categoria.nombre}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Información Básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Básica</CardTitle>
                                <CardDescription>
                                    Datos principales de la categoría
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    label="Código"
                                    name="codigo"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                    error={errors.codigo}
                                    required
                                    placeholder="CAT-001"
                                    helpText="Código único de identificación"
                                />

                                <FormField
                                    label="Nombre"
                                    name="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    error={errors.nombre}
                                    required
                                    placeholder="Ej: Herramientas Manuales"
                                />

                                <TextareaField
                                    label="Descripción"
                                    name="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    error={errors.descripcion}
                                    placeholder="Descripción detallada de la categoría"
                                    rows={4}
                                />
                            </CardContent>
                        </Card>

                        {/* Configuración */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración</CardTitle>
                                <CardDescription>
                                    Jerarquía y estado de la categoría
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SelectField
                                    label="Categoría Padre"
                                    name="padre_id"
                                    value={data.padre_id}
                                    onChange={(value) => setData('padre_id', value)}
                                    options={[
                                        { value: '', label: 'Sin categoría padre (nivel raíz)' },
                                        ...categoriasOptions,
                                    ]}
                                    error={errors.padre_id}
                                    helpText="Seleccione una categoría padre para crear una subcategoría"
                                />

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="activo"
                                            checked={data.activo}
                                            onCheckedChange={(checked) =>
                                                setData('activo', checked === true)
                                            }
                                        />
                                        <Label htmlFor="activo" className="cursor-pointer">
                                            Categoría activa
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Las categorías inactivas no estarán disponibles para asignar a items
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Botones de Acción */}
                    <div className="mt-6 flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" asChild disabled={processing}>
                            <Link href={route('catalogos.categorias-items.index')}>
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
