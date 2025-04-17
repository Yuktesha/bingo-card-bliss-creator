import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaperSize, Unit, Orientation, Alignment, BorderStyle, FillType, TextImagePosition, TextOrientation } from '@/types';
import { useBingo } from '@/contexts/BingoContext';
import { convertUnits, getPaperSizeDimensions, generateBingoCardPDF } from '@/utils/pdfUtils';
import { renderBingoCardPreview, generateBingoCards } from '@/utils/bingoCardGenerator';
import { ColorPicker } from "@/components/ui/color-picker";
import { Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Download, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  AlignJustify,
  Shuffle
} from 'lucide-react';

const CardPreview: React.FC = () => {
  const { settings, items } = useBingo();
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  const refreshPreview = async () => {
    setIsLoading(true);
    try {
      // Use the canvas element to create a data URL
      const canvas = renderBingoCardPreview(items, settings);
      
      // Convert canvas to data URL
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          setPreviewSrc(dataUrl);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to convert canvas to data URL:', error);
          setPreviewSrc(null);
          toast({
            title: '預覽生成失敗',
            description: '無法載入圖片或生成預覽',
            variant: 'destructive'
          });
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewSrc(null);
      toast({
        title: '預覽生成失敗',
        description: '無法載入圖片或生成預覽',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  // Generate preview using the bingo card generator
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

const AlignmentSelector: React.FC<{
  value: Alignment;
  onChange: (value: Alignment) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-1 w-full max-w-[120px]">
      {(['top-left', 'top-center', 'top-right', 
         'middle-left', 'middle-center', 'middle-right',
         'bottom-left', 'bottom-center', 'bottom-right'] as Alignment[]).map(alignment => (
        <Button
          key={alignment}
          type="button"
          size="sm"
          variant={value === alignment ? "default" : "outline"}
          className="p-1 h-8"
          onClick={() => onChange(alignment)}
        >
          <div className={`w-full h-full flex items-${alignment.includes('top') ? 'start' : alignment.includes('middle') ? 'center' : 'end'} justify-${alignment.includes('left') ? 'start' : alignment.includes('center') ? 'center' : 'end'}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
          </div>
        </Button>
      ))}
    </div>
  );
};

const CardSettingsTab: React.FC = () => {
  const { settings, setSettings, items, shuffleItems } = useBingo();
  
  const handleUnitChange = (newUnit: Unit) => {
    const oldUnit = settings.unit;
    
    if (oldUnit === newUnit) return;
    
    setSettings(prev => ({
      ...prev,
      unit: newUnit,
      width: parseFloat(convertUnits(prev.width, oldUnit, newUnit).toFixed(2)),
      height: parseFloat(convertUnits(prev.height, oldUnit, newUnit).toFixed(2)),
      margins: {
        ...prev.margins,
        top: parseFloat(convertUnits(prev.margins.top, oldUnit, newUnit).toFixed(2)),
        right: parseFloat(convertUnits(prev.margins.right, oldUnit, newUnit).toFixed(2)),
        bottom: parseFloat(convertUnits(prev.margins.bottom, oldUnit, newUnit).toFixed(2)),
        left: parseFloat(convertUnits(prev.margins.left, oldUnit, newUnit).toFixed(2)),
      },
      title: {
        ...prev.title,
        height: parseFloat(convertUnits(prev.title.height, oldUnit, newUnit).toFixed(2)),
      },
      footer: {
        ...prev.footer,
        height: parseFloat(convertUnits(prev.footer.height, oldUnit, newUnit).toFixed(2)),
      },
      sectionSpacing: parseFloat(convertUnits(prev.sectionSpacing, oldUnit, newUnit).toFixed(2)),
    }));
  };

  const handlePaperSizeChange = (newSize: PaperSize) => {
    if (newSize === 'Custom') {
      setSettings(prev => ({
        ...prev,
        paperSize: 'Custom'
      }));
      return;
    }
    
    const { width, height } = getPaperSizeDimensions(
      newSize, 
      settings.orientation
    );
    
    setSettings(prev => ({
      ...prev,
      paperSize: newSize,
      width,
      height
    }));
  };

  const handleOrientationChange = (newOrientation: Orientation) => {
    if (settings.paperSize === 'Custom' || newOrientation === settings.orientation) {
      setSettings(prev => ({
        ...prev,
        orientation: newOrientation
      }));
      return;
    }
    
    // Swap dimensions for standard paper sizes
    setSettings(prev => ({
      ...prev,
      orientation: newOrientation,
      width: prev.height,
      height: prev.width
    }));
  };

  const handleMarginChange = (margin: keyof typeof settings.margins, value: number) => {
    if (margin === 'linked') {
      setSettings(prev => ({
        ...prev,
        margins: {
          ...prev.margins,
          linked: !prev.margins.linked
        }
      }));
      return;
    }
    
    if (settings.margins.linked) {
      setSettings(prev => ({
        ...prev,
        margins: {
          ...prev.margins,
          top: value,
          right: value,
          bottom: value,
          left: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        margins: {
          ...prev.margins,
          [margin]: value
        }
      }));
    }
  };

  const handleGeneratePDF = () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('請先選擇至少一個項目');
      return;
    }
    
    const cellsPerCard = settings.table.rows * settings.table.columns;
    if (selectedItems.length < cellsPerCard) {
      alert(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
      return;
    }
    
    try {
      // Generate unique bingo cards
      const cards = generateBingoCards(
        items,
        settings,
        settings.export.numberOfCards
      );
      
      // In a real app, this would generate a PDF file with all cards
      const pdfBlob = generateBingoCardPDF(
        selectedItems,
        settings,
        settings.export.numberOfCards
      );
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bingo-cards-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('生成 PDF 時發生錯誤');
      }
    }
  };

  const tableHeight = settings.height - 
                     settings.margins.top - 
                     settings.margins.bottom - 
                     (settings.title.show ? settings.title.height + settings.sectionSpacing : 0) -
                     (settings.footer.show ? settings.footer.height + settings.sectionSpacing : 0);
  
  const tableWidth = settings.width - 
                     settings.margins.left - 
                     settings.margins.right;

  return (
    <div className="flex h-full">
      <div className="w-2/3 pr-4">
        <CardPreview />
      </div>
      
      <div className="w-1/3 border-l pl-4">
        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">版面設定</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>頁面大小</Label>
                    <Select
                      value={settings.paperSize}
                      onValueChange={value => handlePaperSizeChange(value as PaperSize)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇紙張大小" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="B5">B5</SelectItem>
                        <SelectItem value="Custom">自訂</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>方向</Label>
                    <Select
                      value={settings.orientation}
                      onValueChange={value => handleOrientationChange(value as Orientation)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇方向" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">直式</SelectItem>
                        <SelectItem value="landscape">橫式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>寬度</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={settings.width}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          width: parseFloat(e.target.value) || prev.width,
                          paperSize: 'Custom'
                        }))}
                        min={1}
                        step={0.1}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>高度</Label>
                    <Input
                      type="number"
                      value={settings.height}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        height: parseFloat(e.target.value) || prev.height,
                        paperSize: 'Custom'
                      }))}
                      min={1}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>單位</Label>
                    <Select
                      value={settings.unit}
                      onValueChange={value => handleUnitChange(value as Unit)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇單位" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="inch">inch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>頁面邊距</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="linked-margins" className="text-sm">連動</Label>
                      <Checkbox
                        id="linked-margins"
                        checked={settings.margins.linked}
                        onCheckedChange={() => handleMarginChange('linked', 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>上</Label>
                      <Input
                        type="number"
                        value={settings.margins.top}
                        onChange={e => handleMarginChange('top', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>右</Label>
                      <Input
                        type="number"
                        value={settings.margins.right}
                        onChange={e => handleMarginChange('right', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>下</Label>
                      <Input
                        type="number"
                        value={settings.margins.bottom}
                        onChange={e => handleMarginChange('bottom', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>左</Label>
                      <Input
                        type="number"
                        value={settings.margins.left}
                        onChange={e => handleMarginChange('left', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>區段間距</Label>
                  <Input
                    type="number"
                    value={settings.sectionSpacing}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      sectionSpacing: parseFloat(e.target.value) || 0
                    }))}
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">遊戲卡產生形式</h3>
              
              <Tabs defaultValue="title">
                <TabsList className="w-full">
                  <TabsTrigger value="title" className="flex-1">標題區</TabsTrigger>
                  <TabsTrigger value="table" className="flex-1">表格區</TabsTrigger>
                  <TabsTrigger value="footer" className="flex-1">頁尾區</TabsTrigger>
                </TabsList>
                
                <TabsContent value="title" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="show-title" className="font-medium">顯示標題區</Label>
                    <Checkbox
                      id="show-title"
                      checked={settings.title.show}
                      onCheckedChange={checked => setSettings(prev => ({
                        ...prev,
                        title: {
                          ...prev.title,
                          show: !!checked
                        }
                      }))}
                    />
                  </div>
                  
                  {settings.title.show && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>標題文字</Label>
                        <Input
                          value={settings.title.text}
                          onChange={e => setSettings(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              text: e.target.value
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>字體大小</Label>
                          <Input
                            type="number"
                            value={settings.title.fontSize}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              title: {
                                ...prev.title,
                                fontSize: parseFloat(e.target.value) || 12
                              }
                            }))}
                            min={1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>區域高度</Label>
                          <Input
                            type="number"
                            value={settings.title.height}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              title: {
                                ...prev.title,
                                height: parseFloat(e.target.value) || 5
                              }
                            }))}
                            min={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>字體</Label>
                        <Select
                          value={settings.title.fontFamily}
                          onValueChange={value => setSettings(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              fontFamily: value
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇字體" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>文字顏色</Label>
                        <ColorPicker
                          value={settings.title.color}
                          onChange={value => setSettings(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              color: value
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>背景顏色</Label>
                        <ColorPicker
                          value={settings.title.backgroundColor}
                          onChange={value => setSettings(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              backgroundColor: value
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>對齊方式</Label>
                        <AlignmentSelector
                          value={settings.title.alignment}
                          onChange={value => setSettings(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              alignment: value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="table" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>表格寬度</Label>
                      <div className="h-8 px-3 rounded border flex items-center text-sm">
                        {tableWidth.toFixed(1)} {settings.unit}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>表格高度</Label>
                      <div className="h-8 px-3 rounded border flex items-center text-sm">
                        {tableHeight.toFixed(1)} {settings.unit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>欄數</Label>
                      <Input
                        type="number"
                        value={settings.table.columns}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          table: {
                            ...prev.table,
                            columns: Math.max(1, parseInt(e.target.value) || 1)
                          }
                        }))}
                        min={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>列數</Label>
                      <Input
                        type="number"
                        value={settings.table.rows}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          table: {
                            ...prev.table,
                            rows: Math.max(1, parseInt(e.target.value) || 1)
                          }
                        }))}
                        min={1}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>框線粗細</Label>
                    <Input
                      type="number"
                      value={settings.table.borderWidth}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        table: {
                          ...prev.table,
                          borderWidth: parseFloat(e.target.value) || 0.1
                        }
                      }))}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>框線顏色</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 border rounded" 
                        style={{ backgroundColor: settings.table.borderColor }}
                      />
                      <Input
                        type="color"
                        value={settings.table.borderColor}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          table: {
                            ...prev.table,
                            borderColor: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>框線樣式</Label>
                    <Select
                      value={settings.table.borderStyle}
                      onValueChange={value => setSettings(prev => ({
                        ...prev,
                        table: {
                          ...prev.table,
                          borderStyle: value as BorderStyle
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇框線樣式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">實線</SelectItem>
                        <SelectItem value="dashed">虛線</SelectItem>
                        <SelectItem value="dotted">點狀</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>內容類型</Label>
                    <Select
                      value={settings.table.contentType}
                      onValueChange={value => setSettings(prev => ({
                        ...prev,
                        table: {
                          ...prev.table,
                          contentType: value as 'image-text' | 'image-only' | 'text-only'
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇內容類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image-text">圖文整合</SelectItem>
                        <SelectItem value="image-only">僅圖片</SelectItem>
                        <SelectItem value="text-only">僅文字</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {settings.table.contentType === 'image-text' && (
                    <div className="space-y-2">
                      <Label>文字位置</Label>
                      <Select
                        value={settings.table.textImagePosition}
                        onValueChange={value => setSettings(prev => ({
                          ...prev,
                          table: {
                            ...prev.table,
                            textImagePosition: value as TextImagePosition
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇文字位置" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">上方</SelectItem>
                          <SelectItem value="bottom">下方</SelectItem>
                          <SelectItem value="left">左方</SelectItem>
                          <SelectItem value="right">右方</SelectItem>
                          <SelectItem value="center">中心</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>內容對齊方式</Label>
                    <AlignmentSelector
                      value={settings.table.contentAlignment}
                      onChange={value => setSettings(prev => ({
                        ...prev,
                        table: {
                          ...prev.table,
                          contentAlignment: value
                        }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex gap-2 items-center"
                      onClick={shuffleItems}
                    >
                      <Shuffle size={16} />
                      隨機排列項目
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="footer" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="show-footer" className="font-medium">顯示頁尾區</Label>
                    <Checkbox
                      id="show-footer"
                      checked={settings.footer.show}
                      onCheckedChange={checked => setSettings(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          show: !!checked
                        }
                      }))}
                    />
                  </div>
                  
                  {settings.footer.show && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>頁尾文字</Label>
                        <Input
                          value={settings.footer.text}
                          onChange={e => setSettings(prev => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              text: e.target.value
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>字體大小</Label>
                          <Input
                            type="number"
                            value={settings.footer.fontSize}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                fontSize: parseFloat(e.target.value) || 8
                              }
                            }))}
                            min={1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>區域高度</Label>
                          <Input
                            type="number"
                            value={settings.footer.height}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                height: parseFloat(e.target.value) || 5
                              }
                            }))}
                            min={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>字體</Label>
                        <Select
                          value={settings.footer.fontFamily}
                          onValueChange={value => setSettings(prev => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              fontFamily: value
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇字體" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>文字顏色</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-8 h-8 border rounded" 
                            style={{ backgroundColor: settings.footer.color }}
                          />
                          <Input
                            type="color"
                            value={settings.footer.color}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                color: e.target.value
                              }
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>背景顏色</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-8 h-8 border rounded" 
                            style={{ backgroundColor: settings.footer.backgroundColor }}
                          />
                          <Input
                            type="color"
                            value={settings.footer.backgroundColor}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                backgroundColor: e.target.value
                              }
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>對齊方式</Label>
                        <AlignmentSelector
                          value={settings.footer.alignment}
                          onChange={value => setSettings(prev => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              alignment: value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <Separator />
            
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
                
                <Button 
                  onClick={handleGeneratePDF} 
                  className="w-full flex items-center gap-2"
                >
                  <Download size={16} />
                  產生PDF
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CardSettingsTab;
