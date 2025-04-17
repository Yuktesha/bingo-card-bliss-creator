import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  FilePlus, 
  FolderOpen, 
  Shuffle, 
  Trash, 
  Upload
} from 'lucide-react';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { ImportDataDialog } from './ImportDataDialog';

export const ItemActionsBar: React.FC = () => {
  const { items, setItems, shuffleItems } = useBingo();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bingo-items-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: '資料匯出成功',
        description: '已儲存至下載資料夾'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: '資料匯出失敗',
        description: '請稍後再試',
        variant: 'destructive'
      });
    }
  };
  
  const addNewItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        text: '新項目',
        selected: true
      }
    ]);
  };
  
  const removeSelectedItems = () => {
    const selectedIds = items.filter(item => item.selected).map(item => item.id);
    if (selectedIds.length === 0) {
      toast({
        title: '請先選擇項目',
        description: '請選擇要刪除的項目',
        variant: 'default'
      });
      return;
    }
    
    setItems(prev => prev.filter(item => !item.selected));
    
    toast({
      title: '項目已刪除',
      description: `已刪除 ${selectedIds.length} 個項目`
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
        <FileDown size={16} />
        <span className="hidden sm:inline">匯出資料</span>
      </Button>
      
      <ImportDataDialog />
    </div>
  );
};
