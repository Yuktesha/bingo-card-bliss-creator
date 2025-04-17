
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alignment } from '@/types';

interface AlignmentSelectorProps {
  value: Alignment;
  onChange: (value: Alignment) => void;
}

const AlignmentSelector: React.FC<AlignmentSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-1 w-full max-w-[120px]">
      {(['top-left', 'top-center', 'top-right', 
         'middle-left', 'middle-center', 'middle-right',
         'bottom-left', 'bottom-center', 'bottom-right'] as Alignment[]).map(alignment => (
        <Button
          key={alignment}
          type="button"
          size="sm"
          variant={value === alignment ? "default" : "outline"}
          className="p-1 h-8"
          onClick={() => onChange(alignment)}
        >
          <div className={`w-full h-full flex items-${alignment.includes('top') ? 'start' : alignment.includes('middle') ? 'center' : 'end'} justify-${alignment.includes('left') ? 'start' : alignment.includes('center') ? 'center' : 'end'}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
          </div>
        </Button>
      ))}
    </div>
  );
};

export default AlignmentSelector;
