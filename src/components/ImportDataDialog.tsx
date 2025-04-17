
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useBingo } from '@/contexts/BingoContext';
import { toast } from 'sonner';
import { importItems } from '@/utils/importExportUtils';
import { FileJson, Upload, AlertCircle } from 'lucide-react';

export const ImportDataDialog: React.FC = () => {
  const { setItems } = useBingo();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    importItems(file)
      .then(loadedItems => {
        setItems(loadedItems);
        toast.warning('警告：匯入的圖檔可能不會永久保存', {
          description: '目前上傳的圖檔可能在頁面重整後會消失。請確保保留原始圖檔。'
        });
        setIsOpen(false);
      })
      .catch(error => {
        console.error('Failed to load items:', error);
        toast.error('資料匯入失敗，請確認檔案格式正確');
      });
      
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <DialogDescription>
            匯入先前導出的 JSON 格式資料
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>圖檔儲存限制</AlertTitle>
          <AlertDescription>
            目前上傳的圖檔可能在頁面重整後會消失。建議保留原始圖檔，並在需要時重新上傳。
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
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
      </DialogContent>
    </Dialog>
  );
};

