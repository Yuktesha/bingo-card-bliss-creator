import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FilePlus, 
  Trash, 
  Shuffle, 
  FileDown,
  FileJson
} from 'lucide-react';
import { useBingo } from '@/contexts/BingoContext';
import { toast } from 'sonner';
import { ImportDataDialog } from './ImportDataDialog';

export const ItemActionsBar: React.FC = () => {
  const { items, setItems, shuffleItems } = useBingo();
  
  const handleExport = () => {
    try {
      // Export to JSON format with improved structure
      const exportData = {
        items: items.map(item => ({
          id: item.id,
          image: item.image || "",
          text: item.text,
          selected: item.selected ? 1 : 0
        }))
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bingo-items-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('資料匯出成功');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('資料匯出失敗，請稍後再試');
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
      toast.warning('請先選擇項目');
      return;
    }
    
    setItems(prev => prev.filter(item => !item.selected));
    toast.success(`已刪除 ${selectedIds.length} 個項目`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 border-r pr-2">
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
      </div>
      
      <div className="flex items-center gap-2 border-r pr-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={shuffleItems}
        >
          <Shuffle size={16} />
          <span className="hidden sm:inline">隨機排列</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
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
    </div>
  );
};
