
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBingo } from '@/contexts/BingoContext';
import AlignmentSelector from './AlignmentSelector';

const FooterSettings: React.FC = () => {
  const { settings, setSettings } = useBingo();

  return (
    <div className="space-y-4 pt-4">
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
              placeholder="Yuktesha Studio程式規劃 + LovAble撰寫開發"
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
    </div>
  );
};

export default FooterSettings;
