import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    containerClassName?: string;
}

/**
 * Componente FormField reutilizable
 * Wrapper para Input con Label, error handling y estilos consistentes
 */
export function FormField({
    label,
    name,
    error,
    required = false,
    helpText,
    containerClassName,
    className,
    ...props
}: FormFieldProps) {
    return (
        <div className={cn('space-y-2', containerClassName)}>
            <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
                {label}
            </Label>
            <Input
                id={name}
                name={name}
                className={cn(error && 'border-destructive', className)}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                {...props}
            />
            {error && <InputError id={`${name}-error`} message={error} />}
            {helpText && !error && (
                <p id={`${name}-help`} className="text-sm text-muted-foreground">
                    {helpText}
                </p>
            )}
        </div>
    );
}
