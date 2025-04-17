
import React, { createContext, useState, useContext, useEffect } from 'react';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { getFileNameFromPath, generateId, shuffleArray } from '@/utils/fileUtils';
import { getPaperSizeDimensions } from '@/utils/pdfUtils';

// Default settings for bingo card
const defaultSettings: BingoCardSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  width: 210,
  height: 297,
  unit: 'mm',
  
  margins: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    linked: true,
  },
  
  title: {
    text: '百變賓果遊戲',
    show: true,
    height: 15,
    fontSize: 18,
    fontFamily: 'Arial',
    color: '#000000',
    alignment: 'middle-center',
    backgroundColor: '#FFFFFF',
  },
  
  table: {
    rows: 7,
    columns: 5,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    fillType: 'none',
    fillColor: 'transparent',
    cellPadding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    contentAlignment: 'middle-center',
    contentType: 'image-text',
    imageScaling: 'aspect-fit',
    textImagePosition: 'bottom',
    textImageSpacing: 2,
    textOrientation: 'horizontal',
    textAlignment: 'middle-center',
  },
  
  footer: {
    text: 'Yuktesha Studio程式規劃 + LovAble撰寫開發',
    show: true,
    height: 5,
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#000000',
    alignment: 'middle-center',
    backgroundColor: '#FFFFFF',
  },
  
  sectionSpacing: 5,
  
  export: {
    numberOfCards: 2,
    outputPath: '',
  },
};

interface BingoContextType {
  items: BingoCardItem[];
  setItems: React.Dispatch<React.SetStateAction<BingoCardItem[]>>;
  settings: BingoCardSettings;
  setSettings: React.Dispatch<React.SetStateAction<BingoCardSettings>>;
  selectedItem: BingoCardItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BingoCardItem | null>>;
  addItems: (newItems: Omit<BingoCardItem, 'id'>[]) => void;
  removeItems: (ids: string[]) => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  updateItemText: (id: string, text: string) => void;
  shuffleItems: () => void;
}

const BingoContext = createContext<BingoContextType | undefined>(undefined);

export const BingoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with empty array instead of mock data
  const [items, setItems] = useState<BingoCardItem[]>([]);
  const [settings, setSettings] = useState<BingoCardSettings>(defaultSettings);
  const [selectedItem, setSelectedItem] = useState<BingoCardItem | null>(null);

  // Update dimensions when paper size or orientation changes
  useEffect(() => {
    if (settings.paperSize !== 'Custom') {
      const { width, height } = getPaperSizeDimensions(
        settings.paperSize, 
        settings.orientation
      );
      
      setSettings(prev => ({
        ...prev,
        width,
        height
      }));
    }
  }, [settings.paperSize, settings.orientation]);

  const addItems = (newItems: Omit<BingoCardItem, 'id'>[]) => {
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: generateId()
    }));
    
    setItems(prev => [...prev, ...itemsWithIds]);
  };

  const removeItems = (ids: string[]) => {
    setItems(prev => prev.filter(item => !ids.includes(item.id)));
    if (selectedItem && ids.includes(selectedItem.id)) {
      setSelectedItem(null);
    }
  };

  const toggleItemSelection = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, selected: !item.selected } 
          : item
      )
    );
  };

  const selectAllItems = () => {
    setItems(prev => 
      prev.map(item => ({ ...item, selected: true }))
    );
  };

  const deselectAllItems = () => {
    setItems(prev => 
      prev.map(item => ({ ...item, selected: false }))
    );
  };

  const updateItemText = (id: string, text: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, text } 
          : item
      )
    );
    
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => 
        prev ? { ...prev, text } : null
      );
    }
  };

  const shuffleItems = () => {
    setItems(prev => shuffleArray([...prev]));
  };

  const value = {
    items,
    setItems,
    settings,
    setSettings,
    selectedItem,
    setSelectedItem,
    addItems,
    removeItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateItemText,
    shuffleItems
  };

  return (
    <BingoContext.Provider value={value}>
      {children}
    </BingoContext.Provider>
  );
};

export const useBingo = () => {
  const context = useContext(BingoContext);
  if (context === undefined) {
    throw new Error('useBingo must be used within a BingoProvider');
  }
  return context;
};
