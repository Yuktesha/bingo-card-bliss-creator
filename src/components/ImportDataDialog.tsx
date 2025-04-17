
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { importItems, importFromCSV } from '@/utils/importExportUtils';
import { Upload } from 'lucide-react';

export const ImportDataDialog: React.FC = () => {
  const { setItems } = useBingo();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

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
      
    // 重置輸入
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const csvContent = event.target.result as string;
          const loadedItems = importFromCSV(csvContent);
          
          setItems(loadedItems);
          toast({
            title: 'CSV 匯入成功',
            description: `已匯入 ${loadedItems.length} 個項目`,
          });
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        toast({
          title: 'CSV 匯入失敗',
          description: '請確認 CSV 格式正確',
          variant: 'destructive'
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'CSV 檔案讀取失敗',
        description: '無法讀取檔案',
        variant: 'destructive'
      });
    };
    
    reader.readAsText(file);
    
    // 重置輸入
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Upload size={14} />
          匯入資料
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯入資料</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="json" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="json">JSON 格式</TabsTrigger>
            <TabsTrigger value="csv">CSV 格式</TabsTrigger>
          </TabsList>
          
          <TabsContent value="json" className="space-y-4 py-4">
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
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              匯入 CSV 格式資料 (格式: Image,Text,Select)
            </p>
            <div>
              <input
                type="file"
                ref={csvInputRef}
                onChange={handleImportCSV}
                className="hidden"
                accept=".csv"
              />
              <Button 
                onClick={() => csvInputRef.current?.click()}
                className="w-full"
              >
                選擇 CSV 檔案
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
