
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useBingo } from '@/contexts/BingoContext';
import { processFiles } from '@/utils/fileUtils';
import { FolderOpen, Shuffle, FileDown, FileUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImportDataDialog } from '../ImportDataDialog';

export const ToolbarActions: React.FC = () => {
  const { items, setItems, shuffleItems, selectAllItems, deselectAllItems } = useBingo();
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Handle folder selection
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process the selected files
    const newItems = processFiles(files);
    
    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      toast.success(`已成功導入 ${newItems.length} 個檔案`);
    } else {
      toast.warning('未找到支援的圖片格式檔案');
    }

    // Reset input
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // Export data
  const handleExportData = () => {
    try {
      // Export to JSON format for now
      const exportData = {
        items: items.map(item => ({
          id: item.id,
          image: item.image || "",
          text: item.text,
          selected: item.selected ? 1 : 0
        }))
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bingo-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('資料匯出成功');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('資料匯出失敗');
    }
  };

  // Clear all data
  const handleClearData = () => {
    if (items.length === 0) {
      toast.info('目前沒有資料可清除');
      return;
    }

    if (confirm('確定要清除所有資料嗎？此操作無法恢復。')) {
      setItems([]);
      toast.success('所有資料已清除');
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        <div>
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderSelect}
            className="hidden"
            {...{ webkitdirectory: "", directory: "" } as any}
            multiple
          />
          <Button 
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <FolderOpen size={16} />
            選擇資料夾
          </Button>
        </div>
        
        <Button 
          onClick={shuffleItems}
          className="flex items-center gap-2"
        >
          <Shuffle size={16} />
          隨機排列
        </Button>

        <Button 
          onClick={handleClearData}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          清除資料
        </Button>
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={selectAllItems}>全選</Button>
        <Button variant="outline" onClick={deselectAllItems}>取消全選</Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportData}
        >
          <FileDown size={16} />
          匯出資料
        </Button>
        
        <ImportDataDialog />
      </div>
    </div>
  );
};
