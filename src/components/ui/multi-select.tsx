'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 duration-300',
  {
    variants: {
      variant: {
        default:
          'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-secondary-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-destructive-foreground/10 bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'inverted';
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      placeholder,
      selected,
      onChange,
      className,
      variant,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
      onChange(selected.filter((i) => i !== item));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${
              selected.length > 0 ? 'h-full' : 'h-10'
            }`}
            onClick={() => setOpen(!open)}
            {...props}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selected.length > 0 ? (
                options
                  .filter((item) => selected.includes(item.value))
                  .map((item) => (
                    <Badge
                      key={item.value}
                      className={cn(multiSelectVariants({ variant }))}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(item.value);
                      }}
                    >
                      {item.label}
                      <X className="ml-1 h-4 w-4" />
                    </Badge>
                  ))
              ) : (
                <span className="text-muted-foreground">{placeholder ?? 'Select...'}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={placeholder ?? 'Search...'} />
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              <CommandList>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(
                        selected.includes(option.value)
                          ? selected.filter((item) => item !== option.value)
                          : [...selected, option.value]
                      );
                      setOpen(true);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
MultiSelect.displayName = 'MultiSelect';
