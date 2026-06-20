import React from 'react';
import { ArrowUpDown } from 'lucide-react';

/**
 * AdminTable — Standardized table component for all admin modules.
 *
 * Props:
 *   - headers: Array of objects { key, label, sortable, align } or simple strings.
 *   - data: Array of data items to render.
 *   - renderRow: Function (item, index) => JSX element (should return a <tr>).
 *   - onSort: Function (key) => void (optional).
 *   - sortConfig: Object { key, direction } (optional).
 *   - maxHeight: CSS max-height value (optional).
 *   - minWidth: Tailwind min-width class (default: "min-w-[600px]").
 *   - emptyMessage: React node or string (default: "No records found.").
 *   - className: Extra table classes.
 *   - containerClassName: Extra outer container classes.
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
  return (
    <div className={`bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden ${containerClassName}`}>
      <div 
        className="overflow-x-auto custom-scrollbar"
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
                      className={`py-3.5 px-4 select-none cursor-pointer hover:bg-gray-100/50 transition-colors ${alignClass}`}
                    >
                      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
                        <span>{label}</span>
                        <ArrowUpDown size={11} className={`${isSorted ? 'text-[#001E3C] font-bold' : 'text-gray-405'}`} />
                      </div>
                    </th>
                  );
                }
                
                return (
                  <th key={idx} className={`py-3.5 px-4 ${alignClass}`}>
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
