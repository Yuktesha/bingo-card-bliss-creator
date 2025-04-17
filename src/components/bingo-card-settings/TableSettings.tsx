
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBingo } from '@/contexts/BingoContext';
import { BorderStyle, TextImagePosition } from '@/types';
import AlignmentSelector from './AlignmentSelector';
import { Shuffle } from 'lucide-react';

const TableSettings: React.FC = () => {
  const { settings, setSettings, shuffleItems } = useBingo();

  // Calculate table dimensions
  const tableHeight = settings.height - 
                      settings.margins.top - 
                      settings.margins.bottom - 
                      (settings.title.show ? settings.title.height + settings.sectionSpacing : 0) -
                      (settings.footer.show ? settings.footer.height + settings.sectionSpacing : 0);
  
  const tableWidth = settings.width - 
                      settings.margins.left - 
                      settings.margins.right;

  return (
    <div className="space-y-4 pt-4">
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
    </div>
  );
};

export default TableSettings;
