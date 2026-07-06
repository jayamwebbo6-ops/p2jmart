import React from 'react';

/**
 * PageHeader — Standard admin page title block.
 *
 * Usage:
 *   <PageHeader
 *     title="Product Attributes"
 *     subtitle="Manage variation attributes (Colors, Sizes, Materials, etc.)"
 *   >
 *     {/* optional right-side action buttons *\/}
 *     <AddBtn onClick={...}>Add Item</AddBtn>
 *   </PageHeader>
 */
const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-wrap">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-[#001E3C] truncate">{title}</h1>
      {subtitle && (
        <p className="text-xs text-slate-900 mt-1 truncate">{subtitle}</p>
      )}
    </div>
    {children && (
      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto min-w-0">
        {children}
      </div>
    )}
  </div>
);

export default PageHeader;
