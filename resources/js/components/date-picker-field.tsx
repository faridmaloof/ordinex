import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
    label: string;
    name: string;
    value?: Date | string;
    onChange: (date: Date | undefined) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    containerClassName?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

/**
 * Componente DatePickerField reutilizable
 * Selector de fecha con Calendar de shadcn/ui
 */
export function DatePickerField({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'Seleccione una fecha',
    helpText,
    containerClassName,
    disabled = false,
    minDate,
    maxDate,
}: DatePickerFieldProps) {
    const [open, setOpen] = React.useState(false);

    // Convertir string a Date si es necesario
    const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;

    return (
        <div className={cn('space-y-2', containerClassName)}>
            <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={name}
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateValue && 'text-muted-foreground',
                            error && 'border-destructive'
                        )}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateValue ? format(dateValue, 'PPP', { locale: es }) : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={(date) => {
                            onChange(date);
                            setOpen(false);
                        }}
                        disabled={(date) => {
                            if (minDate && date < minDate) return true;
                            if (maxDate && date > maxDate) return true;
                            return false;
                        }}
                        initialFocus
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
            {error && <InputError id={`${name}-error`} message={error} />}
            {helpText && !error && (
                <p id={`${name}-help`} className="text-sm text-muted-foreground">
                    {helpText}
                </p>
            )}
        </div>
    );
}
