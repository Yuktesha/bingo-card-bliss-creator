
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBingo } from '@/contexts/BingoContext';
import { toast } from 'sonner';
import { importItems } from '@/utils/importExportUtils';
import { FileJson, Upload } from 'lucide-react';

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
        toast.success(`已匯入 ${loadedItems.length} 個項目`);
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
