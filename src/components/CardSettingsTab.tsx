
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import CardPreview from './bingo-card-settings/CardPreview';
import PaperSettings from './bingo-card-settings/PaperSettings';
import CardContentSettings from './bingo-card-settings/CardContentSettings';
import ExportSettings from './bingo-card-settings/ExportSettings';

const CardSettingsTab: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="w-2/3 pr-4">
        <CardPreview />
      </div>
      
      <div className="w-1/3 border-l pl-4">
        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <div className="space-y-6">
            <PaperSettings />
            
            <Separator />
            
            <CardContentSettings />
            
            <Separator />
            
            <ExportSettings />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CardSettingsTab;
