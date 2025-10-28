import { Item } from "@/types";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import FormField from "@/Components/FormField";
import SelectField from "@/Components/SelectField";
import TextareaField from "@/Components/TextareaField";

interface AjustarStockModalProps {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AjustarStockModal({ item, isOpen, onClose }: AjustarStockModalProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        tipo_movimiento: 'ajuste',
        cantidad: 0,
        motivo: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!item) return;
        post(route('items.ajustarStock', item.id));
    };

    useEffect(() => {
        if (wasSuccessful) {
            reset();
            onClose();
        }
    }, [wasSuccessful]);

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajustar Stock de {item.nombre}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="text-lg">Stock Actual: <span className="font-bold">{item.stock_actual}</span></div>
                    <SelectField
                        id="tipo_movimiento"
                        label="Tipo de Movimiento"
                        value={data.tipo_movimiento}
                        onChange={(e) => setData('tipo_movimiento', e.target.value)}
                        error={errors.tipo_movimiento}
                        options={[
                            { value: 'entrada', label: 'Entrada (Sumar al stock)' },
                            { value: 'salida', label: 'Salida (Restar del stock)' },
                            { value: 'ajuste', label: 'Ajuste (Reemplazar stock)' },
                        ]}
                        required
                    />
                    <FormField
                        id="cantidad"
                        label="Cantidad"
                        type="number"
                        value={data.cantidad}
                        onChange={(e) => setData('cantidad', parseFloat(e.target.value))}
                        error={errors.cantidad}
                        required
                    />
                    <TextareaField
                        id="motivo"
                        label="Motivo del ajuste"
                        value={data.motivo}
                        onChange={(e) => setData('motivo', e.target.value)}
                        error={errors.motivo}
                        required
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Ajustar Stock'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
