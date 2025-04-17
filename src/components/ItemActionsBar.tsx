
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Export, 
  FilePlus, 
  FolderOpen, 
  Shuffle, 
  Trash, 
  Import
} from 'lucide-react';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { ImportDataDialog } from './ImportDataDialog';

export const ItemActionsBar: React.FC = () => {
  const { shuffleItems, exportItems, addNewItem, removeSelectedItems } = useBingo();
  const { toast } = useToast();

  const handleExport = () => {
    exportItems()
      .then(() => {
        toast({
          title: '資料匯出成功',
          description: '已儲存至下載資料夾'
        });
      })
      .catch(error => {
        console.error('Export error:', error);
        toast({
          title: '資料匯出失敗',
          description: '請稍後再試',
          variant: 'destructive'
        });
      });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={addNewItem}
      >
        <FilePlus size={16} />
        <span className="hidden sm:inline">新增</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={removeSelectedItems}
      >
        <Trash size={16} />
        <span className="hidden sm:inline">刪除</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={shuffleItems}
      >
        <Shuffle size={16} />
        <span className="hidden sm:inline">隨機排列</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={handleExport}
      >
        <Export size={16} />
        <span className="hidden sm:inline">匯出資料</span>
      </Button>
      
      <ImportDataDialog />
    </div>
  );
};
