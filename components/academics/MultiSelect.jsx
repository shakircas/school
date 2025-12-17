"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
}) {
  const [open, setOpen] = useState(false);

  const safeValue = Array.isArray(value) ? value : [];
  console.log(options)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {safeValue.length ? `${safeValue.length} selected` : placeholder}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No result found.</CommandEmpty>

          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((item) => {
              const selected = safeValue.includes(item.value);

              return (
                <CommandItem
                  key={item.value}
                  onSelect={() => {
                    onChange(
                      selected
                        ? safeValue.filter((v) => v !== item.value)
                        : [...safeValue, item.value]
                    );
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
