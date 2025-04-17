
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBingo } from '@/contexts/BingoContext';
import { useToast } from '@/hooks/use-toast';
import { generateBingoCardPDFAsync } from '@/utils/pdfUtils';
import { Download, Loader2, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { loadPDFFonts } from '@/utils/bingo';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ExportSettings: React.FC = () => {
  const { settings, setSettings, items } = useBingo();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [useHighResolution, setUseHighResolution] = useState(true);
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [fontLoadingStatus, setFontLoadingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Preload Asian fonts when component mounts
  useEffect(() => {
    const preloadFonts = async () => {
      try {
        setFontLoadingStatus('loading');
        const loaded = await loadPDFFonts();
        setIsFontLoaded(loaded);
        setFontLoadingStatus(loaded ? 'success' : 'error');
        console.log('Font preloading completed, status:', loaded);
      } catch (error) {
        console.error('Font preloading failed:', error);
        setFontLoadingStatus('error');
      }
    };
    
    preloadFonts();
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
      
      // If the font wasn't preloaded, attempt to load it before generating PDF
      if (!isFontLoaded) {
        await loadPDFFonts();
      }
      
      const pdfBlob = await generateBingoCardPDFAsync(
        items,
        settings,
        settings.export.numberOfCards,
        {
          highResolution: useHighResolution
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
        {fontLoadingStatus === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <Check size={16} />
            已載入亞洲字體支援
          </div>
        )}
        
        {fontLoadingStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>字體載入失敗</AlertTitle>
            <AlertDescription>
              未能成功載入亞洲字體。PDF中的中文可能無法正確顯示。
            </AlertDescription>
          </Alert>
        )}
        
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
          使用向量繪圖可產生更清晰的文字和線條，並支援中文顯示。圖片仍然為點陣圖，解析度為300 DPI。
        </div>
        
        <Button 
          onClick={handleGeneratePDF} 
          className="w-full flex items-center justify-center gap-2"
          disabled={isGeneratingPDF || fontLoadingStatus === 'loading'}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              生成中...
            </>
          ) : fontLoadingStatus === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              載入字型...
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
