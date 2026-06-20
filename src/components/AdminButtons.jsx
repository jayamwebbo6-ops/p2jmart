import React from 'react';
import { Edit3, Trash2, Plus, CheckCircle, X, RefreshCw, Eye } from 'lucide-react';

/**
 * AdminButtons — shared button components for all admin pages.
 *
 * Usage:
 *   <EditBtn   onClick={...} />
 *   <DeleteBtn onClick={...} />
 *   <AddBtn    onClick={...}>Add Category</AddBtn>
 *   <SaveBtn   type="submit">Save Changes</SaveBtn>
 *   <CancelBtn onClick={...} />
 *   <UpdateBtn onClick={...} />
 */

// ─── Icon-only action buttons (used in tables / cards) ────────────────────────

/** Blue edit icon button */
export const EditBtn = ({ onClick, title = 'Edit', size = 14, className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-200 transition-all active:scale-95 ${className}`}
    {...rest}
  >
    <Edit3 size={size} />
  </button>
);

/** Red delete icon button */
export const DeleteBtn = ({ onClick, title = 'Delete', size = 14, className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-200 transition-all active:scale-95 ${className}`}
    {...rest}
  >
    <Trash2 size={size} />
  </button>
);

/** Light cyan view icon button */
export const ViewBtn = ({ onClick, title = 'View', size = 14, className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:border-cyan-200 transition-all active:scale-95 ${className}`}
    {...rest}
  >
    <Eye size={size} />
  </button>
);

// ─── Full-label action buttons (used in headers / footers / modals) ───────────

/** Dark navy "Add …" button with plus icon */
export const AddBtn = ({ onClick, children = 'Add', disabled = false, className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 bg-[#001E3C] hover:bg-[#002A54] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${className}`}
    {...rest}
  >
    <Plus size={13} />
    {children}
  </button>
);

/** Dark navy primary action button with customizable text and optional icon */
export const PrimaryBtn = ({ onClick, children, icon: Icon, type = 'button', className = '', ...rest }) => (
  <button
    type={type}
    onClick={onClick}
    className={`flex items-center gap-1.5 bg-[#001E3C] hover:bg-[#002A54] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${className}`}
    {...rest}
  >
    {Icon && <Icon size={14} />}
    {children}
  </button>
);

/** Emerald green "Save / Save Product" button */
export const SaveBtn = ({ onClick, children = 'Save', type = 'submit', className = '', ...rest }) => (
  <button
    type={type}
    onClick={onClick}
    className={`flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 ${className}`}
    {...rest}
  >
    <CheckCircle size={14} />
    {children}
  </button>
);

/** Neutral "Cancel" button */
export const CancelBtn = ({ onClick, children = 'Cancel', className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/** Blue "Update" button (variant edit confirm) */
export const UpdateBtn = ({ onClick, children = 'Update', className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 flex-grow bg-[#001E3C] hover:bg-[#002A54] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors justify-center active:scale-95 shadow-sm ${className}`}
    {...rest}
  >
    <RefreshCw size={13} />
    {children}
  </button>
);

/** Blue outlined "← Previous" tab nav button */
export const PrevBtn = ({ onClick, children = 'Previous', className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2.5 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all active:scale-95 ${className}`}
    {...rest}
  >
    ← {children}
  </button>
);

/** Dark "Next →" tab nav button */
export const NextBtn = ({ onClick, children = 'Next', className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-5 py-2.5 bg-[#001E3C] hover:bg-[#002A54] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 ${className}`}
    {...rest}
  >
    {children} →
  </button>
);
