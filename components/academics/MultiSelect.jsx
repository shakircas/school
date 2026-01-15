"use client";

import { X, Check, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
}) {
  const [open, setOpen] = useState(false);

  const safeValue = Array.isArray(value) ? value : [];

  const handleUnselect = (itemValue) => {
    onChange(safeValue.filter((v) => v !== itemValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-xl border-slate-200 bg-white min-h-[44px] h-auto p-1 px-3 hover:bg-white hover:border-primary/50 transition-all",
            open && "ring-2 ring-primary/10 border-primary"
          )}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {safeValue.length > 0 ? (
              options
                .filter((opt) => safeValue.includes(opt.value))
                .map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2 py-0.5 flex items-center gap-1 group animate-in fade-in zoom-in duration-200"
                  >
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUnselect(option.value);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option.value)}
                    >
                      <X className="h-3 w-3 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    </button>
                  </Badge>
                ))
            ) : (
              <span className="text-slate-400 font-normal text-sm ml-1">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-40 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 border-none shadow-2xl rounded-2xl overflow-hidden"
        align="start"
      >
        <Command className="bg-white">
          <div className="flex items-center border-b border-slate-100 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
            <CommandInput
              placeholder="Search curriculum..."
              className="h-11 border-none focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px] p-2">
            <CommandEmpty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = safeValue.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(
                        isSelected
                          ? safeValue.filter((v) => v !== option.value)
                          : [...safeValue, option.value]
                      );
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer mb-1 transition-colors",
                      isSelected
                        ? "bg-primary/5 text-primary font-medium"
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {safeValue.length > 0 && (
            <div className="p-2 border-t border-slate-50 bg-slate-50/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-slate-500 hover:text-rose-600 font-bold uppercase tracking-tighter"
                onClick={() => onChange([])}
              >
                Clear all selections
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}