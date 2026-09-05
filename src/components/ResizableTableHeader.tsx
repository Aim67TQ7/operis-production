import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ColumnConfig {
  key: string;
  label: React.ReactNode;
  minWidth?: number;
  defaultWidth: number;
  className?: string;
  sortable?: boolean;
  onClick?: () => void;
}

interface ResizableTableHeaderProps {
  columns: ColumnConfig[];
  columnWidths: Record<string, number>;
  onColumnResize: (key: string, width: number) => void;
}

export function ResizableTableHeader({
  columns,
  columnWidths,
  onColumnResize,
}: ResizableTableHeaderProps) {
  const [resizing, setResizing] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(columnKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[columnKey] || columns.find(c => c.key === columnKey)?.defaultWidth || 100;
  }, [columnWidths, columns]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - startXRef.current;
    const column = columns.find(c => c.key === resizing);
    const minWidth = column?.minWidth || 50;
    const newWidth = Math.max(minWidth, startWidthRef.current + diff);
    
    onColumnResize(resizing, newWidth);
  }, [resizing, columns, onColumnResize]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  return (
    <>
      {columns.map((column, index) => (
        <TableHead
          key={column.key}
          className={cn(
            "relative select-none",
            column.sortable && "cursor-pointer hover:bg-muted/50",
            column.className
          )}
          style={{ width: columnWidths[column.key] || column.defaultWidth, minWidth: column.minWidth || 50 }}
          onClick={column.onClick}
        >
          <div className="pr-2">
            {column.label}
          </div>
          {/* Resize Handle */}
          {index < columns.length - 1 && (
            <div
              className={cn(
                "absolute right-0 top-0 h-full w-2 cursor-col-resize group",
                "hover:bg-primary/30 transition-colors",
                resizing === column.key && "bg-primary/50"
              )}
              onMouseDown={(e) => handleMouseDown(e, column.key)}
            >
              <div className="absolute right-0 top-0 h-full w-px bg-border group-hover:bg-primary/50" />
            </div>
          )}
        </TableHead>
      ))}
    </>
  );
}

export function useColumnWidths(defaultWidths: Record<string, number>) {
  const [columnWidths, setColumnWidths] = useState(defaultWidths);
  
  const handleColumnResize = useCallback((key: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  }, []);
  
  return { columnWidths, handleColumnResize };
}
