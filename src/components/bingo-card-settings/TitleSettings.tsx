
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from "@/components/ui/color-picker";
import { useBingo } from '@/contexts/BingoContext';
import AlignmentSelector from './AlignmentSelector';

const TitleSettings: React.FC = () => {
  const { settings, setSettings } = useBingo();

  return (
    <div className="space-y-4 pt-4">
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
    </div>
  );
};

export default TitleSettings;
