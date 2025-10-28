import { cn } from '@/lib/utils';

interface MoneyDisplayProps {
    amount: number | string;
    currency?: string;
    className?: string;
    showSign?: boolean;
    colorized?: boolean; // Positivo=verde, Negativo=rojo
}

/**
 * Componente MoneyDisplay
 * Formatea y muestra valores monetarios de forma consistente
 */
export function MoneyDisplay({
    amount,
    currency = 'Bs.',
    className,
    showSign = false,
    colorized = false,
}: MoneyDisplayProps) {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const isNegative = numericAmount < 0;
    const isPositive = numericAmount > 0;

    // Formatear el número con 2 decimales y separador de miles
    const formattedAmount = new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(numericAmount));

    // Determinar el signo
    const sign = isNegative ? '-' : showSign && isPositive ? '+' : '';

    // Determinar el color
    const colorClass = colorized
        ? isNegative
            ? 'text-destructive'
            : isPositive
              ? 'text-green-600'
              : 'text-muted-foreground'
        : '';

    return (
        <span className={cn('font-medium tabular-nums', colorClass, className)}>
            {sign} {currency} {formattedAmount}
        </span>
    );
}
