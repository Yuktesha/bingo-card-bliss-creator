
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BingoCardItem } from '@/types';
import { useBingo } from '@/contexts/BingoContext';
import { getFileNameFromPath, shuffleArray, processFiles, parseSpreadsheet } from '@/utils/fileUtils';
import { simulateFolderSelection, simulateSpreadsheetImport } from '@/utils/mockData';
import { exportToODS, exportToCSV } from '@/utils/exportImportUtils';
import { 
  ArrowUpDown, 
  FolderOpen, 
  FileSpreadsheet, 
  Shuffle, 
  Check, 
  X, 
  Download,
  FileDown 
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const DataSourceTab: React.FC = () => {
  const {
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    selectAllItems,
    deselectAllItems,
    toggleItemSelection,
    updateItemText,
    shuffleItems
  } = useBingo();

  const [sortField, setSortField] = useState<'text' | 'image' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle spreadsheet upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    try {
      // In a real implementation, we would use a proper library to parse spreadsheet files
      // For now, we'll just use a mock implementation
      const data = await parseSpreadsheet(file);
      
      if (data.length > 0) {
        setItems(prev => [...prev, ...data]);
        toast.success(`已成功導入試算表，包含 ${data.length} 筆資料`);
      } else {
        toast.warning('試算表中無有效資料');
      }
    } catch (error) {
      console.error('Error parsing spreadsheet:', error);
      toast.error('試算表解析失敗，請確認檔案格式');
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle sort
  const handleSort = (field: 'text' | 'image') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction
      setSortField(field);
      setSortDirection('asc');
    }

    // Sort the items
    const sortedItems = [...items].sort((a, b) => {
      const valueA = field === 'text' ? a.text : a.image || '';
      const valueB = field === 'text' ? b.text : b.image || '';
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setItems(sortedItems);
  };

  // Select an item for preview
  const handleSelectItem = (item: BingoCardItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  // Export data
  const handleExportData = () => {
    try {
      // Export to JSON format for now
      const blob = exportToODS(items);
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

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex space-x-4 mb-4">
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
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".ods,.xlsx,.csv,.json"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            匯入試算表
          </Button>
        </div>
        
        <Button 
          onClick={shuffleItems}
          className="flex items-center gap-2"
        >
          <Shuffle size={16} />
          隨機排列
        </Button>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <Button variant="outline" onClick={selectAllItems}>全選</Button>
        <Button variant="outline" onClick={deselectAllItems}>取消全選</Button>
        
        <div className="flex-grow"></div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportData}
        >
          <FileDown size={16} />
          匯出資料
        </Button>
      </div>
      
      <div className="flex flex-grow gap-4">
        <div className="w-2/3 overflow-hidden border rounded-md">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">選取</TableHead>
                  <TableHead className="w-1/2 cursor-pointer" onClick={() => handleSort('text')}>
                    <div className="flex items-center">
                      文字 <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                  <TableHead className="w-1/2 cursor-pointer" onClick={() => handleSort('image')}>
                    <div className="flex items-center">
                      圖片路徑 <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow 
                    key={item.id}
                    className={`cursor-pointer ${selectedItem?.id === item.id ? 'bg-muted/50' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={item.selected}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      {selectedItem?.id === item.id ? (
                        <Input 
                          value={item.text} 
                          onChange={e => updateItemText(item.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        item.text
                      )}
                    </TableCell>
                    <TableCell className="truncate">
                      {item.image}
                      {item.fileCheck === false && (
                        <X size={16} className="inline ml-2 text-destructive" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      請選擇資料夾或匯入試算表來加載資料
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        <div className="w-1/3 border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">項目預覽</h3>
          {selectedItem ? (
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
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              選擇一個項目來查看預覽
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSourceTab;
