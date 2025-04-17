
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BingoCardItem } from '@/types';
import { useBingo } from '@/contexts/BingoContext';
import { ArrowUpDown, X } from 'lucide-react';

export const ItemsTable: React.FC = () => {
  const {
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    toggleItemSelection,
    updateItemText
  } = useBingo();

  const [sortField, setSortField] = useState<'text' | 'image' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sort
  const handleSort = (field: 'text' | 'image') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction
      setSortField(field);
      setSortDirection('asc');
    }

    // Sort the items
    const sortedItems = [...items].sort((a, b) => {
      const valueA = field === 'text' ? a.text : a.image || '';
      const valueB = field === 'text' ? b.text : b.image || '';
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setItems(sortedItems);
  };

  // Select an item for preview
  const handleSelectItem = (item: BingoCardItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">選取</TableHead>
            <TableHead className="w-1/2 cursor-pointer" onClick={() => handleSort('text')}>
              <div className="flex items-center">
                文字 <ArrowUpDown size={16} className="ml-1" />
              </div>
            </TableHead>
            <TableHead className="w-1/2 cursor-pointer" onClick={() => handleSort('image')}>
              <div className="flex items-center">
                圖片路徑 <ArrowUpDown size={16} className="ml-1" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow 
              key={item.id}
              className={`cursor-pointer ${selectedItem?.id === item.id ? 'bg-muted/50' : ''}`}
              onClick={() => handleSelectItem(item)}
            >
              <TableCell className="text-center">
                <Checkbox 
                  checked={item.selected}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                  onClick={e => e.stopPropagation()}
                />
              </TableCell>
              <TableCell>
                {selectedItem?.id === item.id ? (
                  <Input 
                    value={item.text} 
                    onChange={e => updateItemText(item.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  item.text
                )}
              </TableCell>
              <TableCell className="truncate">
                {item.image}
                {item.fileCheck === false && (
                  <X size={16} className="inline ml-2 text-destructive" />
                )}
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                請選擇資料夾來加載資料
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
