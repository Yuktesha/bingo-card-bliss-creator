import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { generateBingoCardPDFAsync } from '@/utils/pdfUtils';
import { Download, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { setupPDFFonts } from '@/utils/bingo';

const ExportSettings: React.FC = () => {
  const { settings, setSettings, items } = useBingo();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [useHighResolution, setUseHighResolution] = useState(true);
  const [fontSetupDone, setFontSetupDone] = useState(false);
  
  useEffect(() => {
    const prepareForPDF = async () => {
      try {
        const success = await setupPDFFonts();
        setFontSetupDone(success);
        console.log('PDF system font setup completed with CJK support');
      } catch (error) {
        console.error('Font setup error:', error);
        setFontSetupDone(false);
      }
    };
    
    prepareForPDF();
  }, []);
  
  const handleGeneratePDF = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast({
        title: '無法生成 PDF',
        description: '請先選擇至少一個項目',
        variant: 'destructive'
      });
      return;
    }
    
    const cellsPerCard = settings.table.rows * settings.table.columns;
    if (selectedItems.length < cellsPerCard) {
      toast({
        title: '無法生成 PDF',
        description: `需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      
      const pdfBlob = await generateBingoCardPDFAsync(
        items,
        settings,
        settings.export.numberOfCards,
        {
          highResolution: useHighResolution,
          useSystemFonts: true,
          useCJKSupport: true
        }
      );
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bingo-cards-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF 生成成功',
        description: `已建立包含 ${settings.export.numberOfCards} 個賓果卡的 PDF`,
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      toast({
        title: '生成 PDF 失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">PDF匯出</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>遊戲卡數量</Label>
          <Input
            type="number"
            value={settings.export.numberOfCards}
            onChange={e => setSettings(prev => ({
              ...prev,
              export: {
                ...prev.export,
                numberOfCards: Math.max(1, parseInt(e.target.value) || 1)
              }
            }))}
            min={1}
          />
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <Checkbox 
            id="useHighRes"
            checked={useHighResolution}
            onCheckedChange={(checked) => setUseHighResolution(!!checked)}
          />
          <Label htmlFor="useHighRes" className="text-sm font-normal cursor-pointer">
            使用向量繪圖（更清晰的文字和線條）
          </Label>
        </div>
        
        <div className="text-xs text-muted-foreground pb-2">
          使用向量繪圖可產生更清晰的文字和線條。如果中文顯示發生問題，系統會自動切換至
          300 DPI 的高解析度點陣圖方案。圖片使用高品質 JPEG 壓縮以平衡檔案大小。
        </div>
        
        <Button 
          onClick={handleGeneratePDF} 
          className="w-full flex items-center justify-center gap-2"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Download size={16} />
              產生PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExportSettings;
