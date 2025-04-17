
import React from 'react';
import { ToolbarActions } from './data-source/ToolbarActions';
import { ItemsTable } from './data-source/ItemsTable';
import { ItemPreview } from './data-source/ItemPreview';
import { useBingo } from '@/contexts/BingoContext';

const DataSourceTab: React.FC = () => {
  // Validate that the context is working by accessing it
  const { items } = useBingo();
  
  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between items-center">
        <ToolbarActions />
      </div>
      
      <div className="flex flex-grow gap-4">
        <div className="w-2/3 overflow-hidden border rounded-md">
          <ItemsTable />
        </div>
        
        <div className="w-1/3 border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">項目預覽</h3>
          <ItemPreview />
        </div>
      </div>
    </div>
  );
};

export default DataSourceTab;
