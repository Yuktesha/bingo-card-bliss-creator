
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { importItems } from '@/utils/importExportUtils';
import { parseSpreadsheet } from '@/utils/fileUtils';
import { FileJson, Upload } from 'lucide-react';

export const ImportDataDialog: React.FC = () => {
  const { setItems } = useBingo();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    importItems(file)
      .then(loadedItems => {
        setItems(loadedItems);
        toast({
          title: '資料匯入成功',
          description: `已匯入 ${loadedItems.length} 個項目`,
        });
        setIsOpen(false);
      })
      .catch(error => {
        console.error('Failed to load items:', error);
        toast({
          title: '資料匯入失敗',
          description: '請確認檔案格式正確',
          variant: 'destructive'
        });
      });
      
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    parseSpreadsheet(file)
      .then(loadedItems => {
        setItems(loadedItems);
        toast({
          title: '試算表匯入成功',
          description: `已匯入 ${loadedItems.length} 個項目`,
        });
        setIsOpen(false);
      })
      .catch(error => {
        console.error('Failed to load spreadsheet:', error);
        toast({
          title: '試算表匯入失敗',
          description: '請確認檔案格式正確',
          variant: 'destructive'
        });
      });
      
    // Reset input
    if (spreadsheetInputRef.current) spreadsheetInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <FileJson size={16} />
          匯入資料
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯入資料</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              匯入先前導出的 JSON 格式資料
            </p>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                className="hidden"
                accept=".json"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                選擇 JSON 檔案
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm text-gray-500">
              從試算表匯入資料 (Excel, CSV)
            </p>
            <div>
              <input
                type="file"
                ref={spreadsheetInputRef}
                onChange={handleImportSpreadsheet}
                className="hidden"
                accept=".xlsx,.xls,.csv"
              />
              <Button 
                onClick={() => spreadsheetInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                選擇試算表檔案
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
