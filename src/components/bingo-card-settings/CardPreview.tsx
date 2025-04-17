
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';
import { useBingo } from '@/contexts/BingoContext';
import { renderBingoCardPreviewAsync } from '@/utils/bingo';

const CardPreview: React.FC = () => {
  const { settings, items } = useBingo();
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  const refreshPreview = async () => {
    setIsLoading(true);
    try {
      const dataUrl = await renderBingoCardPreviewAsync(items, settings);
      setPreviewSrc(dataUrl);
    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewSrc(null);
      toast({
        title: '預覽生成失敗',
        description: '無法載入圖片或生成預覽',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshPreview();
  }, [settings, items]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">賓果卡預覽</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => {
              const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `bingo-settings-${new Date().toISOString().slice(0, 10)}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            <Save size={16} />
            儲存設定
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={refreshPreview}
          >
            <RefreshCw size={16} />
            重整預覽
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 flex-grow flex items-center justify-center p-4 overflow-auto">
        {isLoading ? (
          <div className="text-muted-foreground flex flex-col items-center">
            <div className="animate-spin mb-2">
              <RefreshCw size={24} />
            </div>
            <span>載入預覽中...</span>
          </div>
        ) : previewSrc ? (
          <img 
            src={previewSrc} 
            alt="Bingo Card Preview" 
            className="max-w-full max-h-full object-contain shadow-md"
          />
        ) : (
          <div className="text-muted-foreground">無法生成預覽，請檢查設定</div>
        )}
      </div>
    </div>
  );
};

export default CardPreview;
