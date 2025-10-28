import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Cliente, Item as ItemType } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import FormField from '@/Components/FormField';
import TextareaField from '@/Components/TextareaField';
import ComboboxField from '@/Components/ComboboxField';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import MoneyDisplay from '@/Components/MoneyDisplay';

interface CreateSolicitudProps extends PageProps {
    clientes: Cliente[];
    items: ItemType[];
}

interface SolicitudItemForm {
    item_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
}

export default function CreateSolicitud({ auth, clientes, items }: CreateSolicitudProps) {
    const { data, setData, post, errors, processing } = useForm({
        cliente_id: '',
        fecha: new Date().toISOString().slice(0, 10),
        fecha_entrega_estimada: '',
        observaciones: '',
        items: [] as SolicitudItemForm[],
        subtotal: 0,
        descuento_total: 0,
        iva: 0,
        total: 0,
    });

    const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

    useEffect(() => {
        const newSubtotal = data.items.reduce((acc, item) => acc + item.subtotal, 0);
        // Simple IVA calculation for example
        const newIva = newSubtotal * 0.19;
        const newTotal = newSubtotal + newIva;
        setData(currentData => ({
            ...currentData,
            subtotal: newSubtotal,
            total: newTotal,
            iva: newIva,
        }));
    }, [data.items]);

    const handleAddItem = () => {
        if (!selectedItem) return;

        const newItem: SolicitudItemForm = {
            item_id: selectedItem.id.toString(),
            nombre: selectedItem.nombre,
            cantidad: 1,
            precio_unitario: selectedItem.precio_venta,
            descuento: 0,
            subtotal: selectedItem.precio_venta * 1,
        };

        setData('items', [...data.items, newItem]);
        setSelectedItem(null);
    };

    const handleItemChange = (index: number, field: keyof SolicitudItemForm, value: any) => {
        const updatedItems = [...data.items];
        const item = updatedItems[index];
        (item[field] as any) = value;

        // Recalculate subtotal for the item
        const cantidad = Number(item.cantidad);
        const precio = Number(item.precio_unitario);
        const descuento = Number(item.descuento);
        item.subtotal = (cantidad * precio) * (1 - descuento / 100);

        setData('items', updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('solicitudes.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl">Crear Solicitud</h2>}>
            <Head title="Crear Solicitud" />
            <div className="py-12">
                <form onSubmit={submit} className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ComboboxField
                                id="cliente_id"
                                label="Cliente"
                                options={clientes.map(c => ({ value: c.id.toString(), label: c.nombre }))}
                                onSelect={value => setData('cliente_id', value)}
                                error={errors.cliente_id}
                            />
                            <FormField id="fecha" label="Fecha" type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} error={errors.fecha} />
                            <FormField id="fecha_entrega_estimada" label="Fecha Entrega Estimada" type="date" value={data.fecha_entrega_estimada} onChange={e => setData('fecha_entrega_estimada', e.target.value)} error={errors.fecha_entrega_estimada} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Items de la Solicitud</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-end space-x-2 mb-4">
                                <div className="flex-grow">
                                    <ComboboxField
                                        id="item-search"
                                        label="Buscar y agregar item"
                                        options={items.map(i => ({ value: i.id.toString(), label: i.nombre }))}
                                        onSelect={value => setSelectedItem(items.find(i => i.id.toString() === value) || null)}
                                    />
                                </div>
                                <Button type="button" onClick={handleAddItem} disabled={!selectedItem}>Agregar</Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio Unit.</TableHead>
                                        <TableHead>Desc. %</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell><input type="number" value={item.cantidad} onChange={e => handleItemChange(index, 'cantidad', e.target.value)} className="w-20" /></TableCell>
                                            <TableCell><input type="number" value={item.precio_unitario} onChange={e => handleItemChange(index, 'precio_unitario', e.target.value)} className="w-24" /></TableCell>
                                            <TableCell><input type="number" value={item.descuento} onChange={e => handleItemChange(index, 'descuento', e.target.value)} className="w-16" /></TableCell>
                                            <TableCell><MoneyDisplay amount={item.subtotal} /></TableCell>
                                            <TableCell><Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)}>X</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {errors.items && <p className="text-sm text-red-600 mt-2">{errors.items}</p>}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
                            <CardContent>
                                <TextareaField id="observaciones" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} error={errors.observaciones} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between"><p>Subtotal:</p><MoneyDisplay amount={data.subtotal} /></div>
                                <div className="flex justify-between"><p>IVA (19%):</p><MoneyDisplay amount={data.iva} /></div>
                                <div className="flex justify-between font-bold text-lg"><p>Total:</p><MoneyDisplay amount={data.total} /></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar Solicitud'}</Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
