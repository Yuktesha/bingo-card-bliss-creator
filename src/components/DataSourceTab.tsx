
import React from 'react';
import { ToolbarActions } from './data-source/ToolbarActions';
import { ItemsTable } from './data-source/ItemsTable';
import { ItemPreview } from './data-source/ItemPreview';
import { useBingo } from '@/contexts/BingoContext';

const DataSourceTab: React.FC = () => {
  try {
    // Use the BingoContext
    useBingo();
    
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
  } catch (error) {
    console.error("DataSourceTab must be used within a BingoProvider", error);
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-red-500 mb-2">錯誤：需要 BingoProvider</h3>
        <p className="text-muted-foreground">請確保應用程序已正確設置 BingoProvider</p>
      </div>
    );
  }
};

export default DataSourceTab;
