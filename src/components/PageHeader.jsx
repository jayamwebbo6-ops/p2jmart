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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[#001E3C]">{title}</h1>
      {subtitle && (
        <p className="text-xs text-slate-900 mt-1">{subtitle}</p>
      )}
    </div>
    {children && (
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        {children}
      </div>
    )}
  </div>
);

export default PageHeader;
