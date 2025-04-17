
import React from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded-md border overflow-hidden flex-shrink-0 hover:ring-2 ring-offset-2 ring-primary focus:outline-none"
            style={{ backgroundColor: value }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div 
              className="w-40 h-40 mb-3 rounded relative overflow-hidden"
              style={{
                background: `linear-gradient(to top, #000, transparent), 
                             linear-gradient(to right, #fff, transparent), 
                             ${value}`
              }}
            >
              <div className="absolute inset-0" />
            </div>
            <Input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-24 flex-grow"
        placeholder="#000000"
      />
    </div>
  );
};
