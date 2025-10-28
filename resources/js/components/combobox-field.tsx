import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
    subtitle?: string;
}

interface ComboboxFieldProps {
    label: string;
    name: string;
    value?: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    error?: string;
    required?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    helpText?: string;
    containerClassName?: string;
    disabled?: boolean;
}

/**
 * Componente ComboboxField reutilizable
 * Select con búsqueda/filtrado para listas grandes
 */
export function ComboboxField({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required = false,
    placeholder = 'Seleccione una opción',
    searchPlaceholder = 'Buscar...',
    emptyText = 'No se encontraron resultados',
    helpText,
    containerClassName,
    disabled = false,
}: ComboboxFieldProps) {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find((option) => option.value === value);

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
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                        className={cn(
                            'w-full justify-between',
                            !value && 'text-muted-foreground',
                            error && 'border-destructive'
                        )}
                        disabled={disabled}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value === value ? '' : option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === option.value ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            {option.subtitle && (
                                                <span className="text-xs text-muted-foreground">
                                                    {option.subtitle}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
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
