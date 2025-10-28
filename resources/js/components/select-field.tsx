import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    name: string;
    value?: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    error?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    containerClassName?: string;
    disabled?: boolean;
}

/**
 * Componente SelectField reutilizable
 * Wrapper para Select de shadcn/ui con Label, error handling y estilos consistentes
 */
export function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required = false,
    placeholder = 'Seleccione una opción',
    helpText,
    containerClassName,
    disabled = false,
}: SelectFieldProps) {
    return (
        <div className={cn('space-y-2', containerClassName)}>
            <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
                {label}
            </Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={name}
                    className={cn(error && 'border-destructive')}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <InputError id={`${name}-error`} message={error} />}
            {helpText && !error && (
                <p id={`${name}-help`} className="text-sm text-muted-foreground">
                    {helpText}
                </p>
            )}
        </div>
    );
}
