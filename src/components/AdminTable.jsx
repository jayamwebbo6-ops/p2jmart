import React, { useRef, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

/**
 * AdminTable — Standardized table component for all admin modules.
 * Now features grab-and-swipe horizontal mouse scrolling for seamless desktop navigation.
 */
const AdminTable = ({
  headers = [],
  data = [],
  renderRow,
  onSort,
  sortConfig = { key: null, direction: 'asc' },
  maxHeight,
  minWidth = 'min-w-[600px]',
  emptyMessage = 'No records found.',
  className = '',
  containerClassName = ''
}) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    // Prevent scrolling swipe if interacting with buttons, selects, or links
    const tag = e.target.tagName.toLowerCase();
    if (
      tag === 'button' || 
      tag === 'select' || 
      tag === 'input' || 
      tag === 'a' || 
      e.target.closest('button') || 
      e.target.closest('select') || 
      e.target.closest('input') || 
      e.target.closest('a')
    ) {
      return;
    }
    
    // Only scroll with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className={`bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden ${containerClassName}`}>
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`overflow-x-auto custom-scrollbar select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className={`w-full text-left border-collapse ${minWidth} ${className}`}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-150 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {headers.map((header, idx) => {
                const isObj = typeof header === 'object' && header !== null;
                const label = isObj ? header.label : header;
                const key = isObj ? header.key : null;
                const sortable = isObj ? header.sortable : false;
                const align = isObj ? header.align : 'left';
                
                const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                
                if (sortable && onSort && key) {
                  const isSorted = sortConfig.key === key;
                  return (
                    <th 
                      key={idx}
                      onClick={() => onSort(key)}
                      className={`py-3 px-2.5 select-none cursor-pointer hover:bg-gray-100/50 transition-colors ${alignClass}`}
                    >
                      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
                        <span>{label}</span>
                        <ArrowUpDown size={11} className={`${isSorted ? 'text-[#001E3C] font-bold' : 'text-gray-405'}`} />
                      </div>
                    </th>
                  );
                }
                
                return (
                  <th key={idx} className={`py-3 px-2.5 ${alignClass}`}>
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-12 text-xs font-medium text-gray-400 bg-slate-50/50">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTable;
