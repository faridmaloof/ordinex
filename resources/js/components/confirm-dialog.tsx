import * as React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    loading?: boolean;
}

/**
 * Componente ConfirmDialog
 * Dialog de confirmación reutilizable para acciones críticas
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    loading = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                        {loading ? 'Procesando...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * Hook useConfirmDialog
 * Simplifica el uso del ConfirmDialog
 */
export function useConfirmDialog() {
    const [open, setOpen] = React.useState(false);
    const [config, setConfig] = React.useState<{
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: 'default' | 'destructive';
        confirmText?: string;
        cancelText?: string;
    } | null>(null);

    const confirm = React.useCallback(
        (options: {
            title: string;
            description: string;
            onConfirm: () => void;
            variant?: 'default' | 'destructive';
            confirmText?: string;
            cancelText?: string;
        }) => {
            setConfig(options);
            setOpen(true);
        },
        []
    );

    const handleConfirm = () => {
        if (config) {
            config.onConfirm();
            setOpen(false);
        }
    };

    const dialog = config ? (
        <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            onConfirm={handleConfirm}
            title={config.title}
            description={config.description}
            variant={config.variant}
            confirmText={config.confirmText}
            cancelText={config.cancelText}
        />
    ) : null;

    return { confirm, dialog };
}
