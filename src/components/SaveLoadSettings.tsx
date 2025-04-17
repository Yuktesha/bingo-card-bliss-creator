
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useBingo } from '@/contexts/BingoContext';
import { exportSettings, importSettings } from '@/utils/exportImportUtils';
import { Save, Upload } from 'lucide-react';

export const SaveLoadSettings: React.FC = () => {
  const { settings, setSettings } = useBingo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    const blob = exportSettings(settings);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bingo-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    importSettings(file)
      .then(loadedSettings => {
        setSettings(loadedSettings);
      })
      .catch(error => {
        console.error('Failed to load settings:', error);
        alert('設定檔載入失敗，請確認檔案格式正確');
      });
      
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleSaveSettings}
      >
        <Save size={14} />
        儲存設定
      </Button>
      
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLoadSettings}
          className="hidden"
          accept=".json"
        />
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} />
          載入設定
        </Button>
      </div>
    </div>
  );
};
