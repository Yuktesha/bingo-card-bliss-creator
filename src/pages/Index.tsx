
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BingoProvider } from '@/contexts/BingoContext';
import DataSourceTab from '@/components/DataSourceTab';
import CardSettingsTab from '@/components/CardSettingsTab';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  useEffect(() => {
    // Display a welcome toast when the app loads
    toast.info('歡迎使用賓果遊戲卡產生器', {
      description: '先選擇「資料來源」，然後配置「遊戲卡設定」',
      duration: 5000,
    });
  }, []);

  return (
    <BingoProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-bingo-title text-white p-4">
          <h1 className="text-2xl font-bold">賓果遊戲卡產生器</h1>
        </header>
        
        <div className="flex-grow p-4">
          <Tabs defaultValue="data-source" className="h-full flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="data-source" className="flex-1">資料來源</TabsTrigger>
              <TabsTrigger value="card-settings" className="flex-1">遊戲卡設定</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data-source" className="flex-grow mt-6">
              <DataSourceTab />
            </TabsContent>
            
            <TabsContent value="card-settings" className="flex-grow mt-6">
              <CardSettingsTab />
            </TabsContent>
          </Tabs>
        </div>
        
        <footer className="bg-bingo-footer text-white p-2 text-center text-sm">
          Yuktesha Studio程式規劃 + WindSurf AI撰寫開發
        </footer>
      </div>
    </BingoProvider>
  );
};

export default Index;
