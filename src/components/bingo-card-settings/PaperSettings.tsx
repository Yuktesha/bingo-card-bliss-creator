
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PaperSize, Unit, Orientation } from '@/types';
import { convertUnits, getPaperSizeDimensions } from '@/utils/pdfUtils';
import { useBingo } from '@/contexts/BingoContext';

const PaperSettings: React.FC = () => {
  const { settings, setSettings } = useBingo();

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

  return (
    <div className="space-y-6">
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
  );
};

export default PaperSettings;
