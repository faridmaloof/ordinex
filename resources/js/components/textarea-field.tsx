import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    containerClassName?: string;
}

/**
 * Componente TextareaField reutilizable
 * Wrapper para Textarea con Label, error handling y estilos consistentes
 */
export function TextareaField({
    label,
    name,
    error,
    required = false,
    helpText,
    containerClassName,
    className,
    ...props
}: TextareaFieldProps) {
    return (
        <div className={cn('space-y-2', containerClassName)}>
            <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
                {label}
            </Label>
            <Textarea
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
