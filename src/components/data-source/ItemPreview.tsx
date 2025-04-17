
import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useBingo } from '@/contexts/BingoContext';
import { getFileNameFromPath } from '@/utils/fileUtils';

export const ItemPreview: React.FC = () => {
  const { selectedItem, updateItemText, toggleItemSelection } = useBingo();

  if (!selectedItem) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        選擇一個項目來查看預覽
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {selectedItem.image ? (
        <div className="w-full mb-4 flex justify-center">
          <img 
            src={selectedItem.image} 
            alt={selectedItem.text} 
            className="max-w-full max-h-[300px] object-contain"
          />
        </div>
      ) : (
        <div className="w-full mb-4 h-[200px] bg-muted flex items-center justify-center text-muted-foreground">
          無圖片
        </div>
      )}
      
      <div className="w-full space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-medium">檔案名稱:</div>
          <div className="col-span-2 truncate">
            {selectedItem.image 
              ? getFileNameFromPath(selectedItem.image)
              : '無圖片'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="font-medium">顯示文字:</div>
          <Input 
            value={selectedItem.text}
            onChange={e => updateItemText(selectedItem.id, e.target.value)}
            className="col-span-2"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="font-medium">選取狀態:</div>
          <div className="col-span-2">
            <Checkbox 
              checked={selectedItem.selected}
              onCheckedChange={() => toggleItemSelection(selectedItem.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
