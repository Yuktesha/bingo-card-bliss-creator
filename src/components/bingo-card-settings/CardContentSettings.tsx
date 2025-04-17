
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TitleSettings from './TitleSettings';
import TableSettings from './TableSettings';
import FooterSettings from './FooterSettings';

const CardContentSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">遊戲卡產生形式</h3>
      
      <Tabs defaultValue="title">
        <TabsList className="w-full">
          <TabsTrigger value="title" className="flex-1">標題區</TabsTrigger>
          <TabsTrigger value="table" className="flex-1">表格區</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1">頁尾區</TabsTrigger>
        </TabsList>
        
        <TabsContent value="title">
          <TitleSettings />
        </TabsContent>
        
        <TabsContent value="table">
          <TableSettings />
        </TabsContent>
        
        <TabsContent value="footer">
          <FooterSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardContentSettings;
