import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  ChevronRight,
  Tag
} from 'lucide-react';
import { toast } from '../../components/toast';
import { GetColorName } from 'hex-color-to-color-name';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddBtn, EditBtn, DeleteBtn, SaveBtn, CancelBtn } from '../../components/AdminButtons';
import PageHeader from '../../components/PageHeader';
import { getAttributesAPI, createAttributeAPI, updateAttributeAPI, deleteAttributeAPI } from '../../api/attributeApi';

const SUGGESTED_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Beige', hex: '#F5F5DC' }
];

const INITIAL_ATTRIBUTES = [
  {
    name: 'color',
    terms: ['Blue|#0000FF', 'Red|#FF0000', 'Green|#008000', 'Yellow|#FFFF00', 'White|#FFFFFF', 'Black|#000000']
  },
  {
    name: 'material',
    terms: ['Wood', 'Acrylic', 'Glass', 'Metal', 'Leather']
  },
  {
    name: 'design',
    terms: ['Minimalist', 'Floral', 'Modern', 'Classic', 'Vintage']
  },
  {
    name: 'size',
    terms: ['3 inch', '5 inch', '7 inch', 'Small', 'Medium', 'Large']
  },
  {
    name: 'ramsize',
    terms: ['4GB', '8GB', '16GB', '32GB']
  }
];

const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [activeAttrId, setActiveAttrId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals / forms state
  const [attrFormOpen, setAttrFormOpen] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [editingAttr, setEditingAttr] = useState(null); // null when adding

  const [newTermValue, setNewTermValue] = useState('');
  const [editingTermIdx, setEditingTermIdx] = useState(null);
  const [editingTermValue, setEditingTermValue] = useState('');

  // Color selection states
  const [selectedHex, setSelectedHex] = useState('#FF0000');
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [filteredColors, setFilteredColors] = useState(SUGGESTED_COLORS);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  // Parse color string
  const parseColorTerm = (term) => {
    if (term.includes('|')) {
      const [name, hex] = term.split('|');
      return { name, hex };
    }
    const found = SUGGESTED_COLORS.find(c => c.name.toLowerCase() === term.trim().toLowerCase());
    return { name: term, hex: found ? found.hex : '#808080' };
  };

  // Load attributes on mount
  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await getAttributesAPI();
      if (res && res.success) {
        let attrs = res.data;
        // If empty, seed initial attributes to DB
        if (attrs.length === 0) {
          const seeded = [];
          for (const item of INITIAL_ATTRIBUTES) {
            const seedRes = await createAttributeAPI({ name: item.name, terms: item.terms });
            if (seedRes && seedRes.success) {
              seeded.push(seedRes.data);
            }
          }
          attrs = seeded;
        }
        setAttributes(attrs);
        if (attrs.length > 0) {
          setActiveAttrId(attrs[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load attributes from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const activeAttribute = attributes.find(a => a._id === activeAttrId) || attributes[0] || null;

  const handleOpenAttrModal = (attr = null) => {
    if (attr) {
      setAttrName(attr.name);
      setEditingAttr(attr);
    } else {
      setAttrName('');
      setEditingAttr(null);
    }
    setAttrFormOpen(true);
  };

  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    if (!attrName.trim()) return toast.error('Attribute Name is required');

    const formattedName = attrName.trim().toLowerCase();

    // Check duplicates
    const duplicate = attributes.find(a => a.name === formattedName && (!editingAttr || a._id !== editingAttr._id));
    if (duplicate) return toast.error(`Attribute "${formattedName}" already exists`);

    try {
      if (editingAttr) {
        const res = await updateAttributeAPI(editingAttr._id, { name: formattedName });
        if (res && res.success) {
          setAttributes(prev => prev.map(a => 
            a._id === editingAttr._id ? res.data : a
          ));
          toast.success('Attribute renamed successfully');
        }
      } else {
        const res = await createAttributeAPI({ name: formattedName, terms: [] });
        if (res && res.success) {
          setAttributes(prev => [...prev, res.data]);
          setActiveAttrId(res.data._id);
          toast.success('Attribute created successfully');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attribute');
    }
    setAttrFormOpen(false);
  };

  const handleDeleteAttribute = (attrId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Attribute',
      'Are you sure you want to delete this attribute and all its values?',
      async () => {
        try {
          const res = await deleteAttributeAPI(attrId);
          if (res && res.success) {
            setAttributes(prev => prev.filter(a => a._id !== attrId));
            if (activeAttrId === attrId) {
              const remaining = attributes.filter(a => a._id !== attrId);
              setActiveAttrId(remaining[0]?._id || '');
            }
            toast.success('Attribute deleted successfully');
          }
        } catch (err) {
          toast.error('Failed to delete attribute');
        }
      }
    );
  };

  // ==========================================
  // TERMS / VALUES ACTIONS
  // ==========================================
  const handleAddTerm = async (e) => {
    e.preventDefault();
    if (!newTermValue.trim()) return;
    if (!activeAttribute) return toast.error('Select an attribute first');

    const termVal = newTermValue.trim();

    // Check duplicates
    if (activeAttribute.terms.some(t => t.toLowerCase() === termVal.toLowerCase())) {
      return toast.error(`Value "${termVal}" already exists in ${activeAttribute.name}`);
    }

    try {
      const updatedTerms = [...activeAttribute.terms, termVal];
      const res = await updateAttributeAPI(activeAttribute._id, { terms: updatedTerms });
      if (res && res.success) {
        setAttributes(prev => prev.map(a => 
          a._id === activeAttribute._id ? res.data : a
        ));
        setNewTermValue('');
        toast.success(`Value "${termVal}" added to ${activeAttribute.name}`);
      }
    } catch (err) {
      toast.error('Failed to add value');
    }
  };

  const handleAddColorTerm = async (e) => {
    e.preventDefault();
    if (!newTermValue.trim()) return;
    if (!activeAttribute) return toast.error('Select an attribute first');

    const colorName = newTermValue.trim();
    const finalHex = selectedHex.toUpperCase();
    const termVal = `${colorName}|${finalHex}`;

    // Check duplicates
    if (activeAttribute.terms.some(t => {
      const parsed = t.includes('|') ? t.split('|')[0] : t;
      return parsed.toLowerCase() === colorName.toLowerCase();
    })) {
      return toast.error(`Color "${colorName}" already exists`);
    }

    try {
      const updatedTerms = [...activeAttribute.terms, termVal];
      const res = await updateAttributeAPI(activeAttribute._id, { terms: updatedTerms });
      if (res && res.success) {
        setAttributes(prev => prev.map(a => 
          a._id === activeAttribute._id ? res.data : a
        ));
        setNewTermValue('');
        setSelectedHex('#FF0000');
        toast.success(`Color "${colorName}" with hex ${finalHex} added`);
      }
    } catch (err) {
      toast.error('Failed to add color value');
    }
  };

  const handleDeleteTerm = (termToDelete) => {
    triggerConfirm(
      'Remove Value',
      `Are you sure you want to remove the value "${termToDelete.includes('|') ? termToDelete.split('|')[0] : termToDelete}" from ${activeAttribute.name}?`,
      async () => {
        try {
          const updatedTerms = activeAttribute.terms.filter(t => t !== termToDelete);
          const res = await updateAttributeAPI(activeAttribute._id, { terms: updatedTerms });
          if (res && res.success) {
            setAttributes(prev => prev.map(a => 
              a._id === activeAttribute._id ? res.data : a
            ));
            toast.success('Value deleted');
          }
        } catch (err) {
          toast.error('Failed to delete value');
        }
      }
    );
  };

  const handleStartEditTerm = (idx, val) => {
    setEditingTermIdx(idx);
    setEditingTermValue(val);
  };

  const handleSaveEditTerm = async (idx) => {
    if (!editingTermValue.trim()) return;

    try {
      const updatedTerms = [...activeAttribute.terms];
      updatedTerms[idx] = editingTermValue.trim();
      const res = await updateAttributeAPI(activeAttribute._id, { terms: updatedTerms });
      if (res && res.success) {
        setAttributes(prev => prev.map(a => 
          a._id === activeAttribute._id ? res.data : a
        ));
        setEditingTermIdx(null);
        toast.success('Value updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update value');
    }
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      <PageHeader
        title="Product Attributes"
        subtitle="Manage variation attributes (Colors, Sizes, Materials, Design Variations, etc.)"
      >
        <AddBtn onClick={() => handleOpenAttrModal()} className="self-start">Add Attribute</AddBtn>
      </PageHeader>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Attribute Names */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/75 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Attribute Name
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Select to manage values</span>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading attributes...</div>
            ) : (
              attributes.map(attr => (
                <div 
                  key={attr._id}
                  onClick={() => setActiveAttrId(attr._id)}
                  className={`group flex items-center justify-between px-4 py-4 cursor-pointer transition-all ${
                    activeAttrId === attr._id 
                      ? 'bg-blue-50/50 text-blue-900 font-semibold' 
                      : 'hover:bg-gray-50/75 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-xs capitalize font-medium">{attr.name}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{attr.terms.length} values defined</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <EditBtn size={12} onClick={(e) => { e.stopPropagation(); handleOpenAttrModal(attr); }} title="Edit Attribute" />
                      <DeleteBtn size={12} onClick={(e) => handleDeleteAttribute(attr._id, e)} title="Delete Attribute" />
                    </div>
                    <ChevronRight size={14} className={`text-gray-400 transition-transform ${activeAttrId === attr._id ? 'translate-x-1 text-blue-600' : ''}`} />
                  </div>
                </div>
              ))
            )}

            {!loading && attributes.length === 0 && (
              <div className="text-center py-12 text-xs text-gray-400">No attributes defined. Click "Add Attribute" to begin.</div>
            )}
          </div>
        </div>

        {/* Right Column: Terms / Values */}
        <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-xl shadow-sm">
          {!loading && activeAttribute ? (
            <>
              {/* Header */}
              <div className="bg-gray-50/75 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Values for: <span className="text-[#001E3C] lowercase font-bold">"{activeAttribute.name}"</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Assign variants or options to your products</span>
                </div>
              </div>

              {/* Terms List */}
              <div className="p-5">
                <div className="flex flex-wrap gap-2.5 mb-6 min-h-[100px] border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/30">
                  {activeAttribute.terms.map((term, idx) => {
                    const isColor = activeAttribute.name === 'color';
                    const colorData = isColor ? parseColorTerm(term) : null;
                    const displayValue = isColor ? colorData.name : term;

                    return (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg pl-2.5 pr-1 py-1 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-300"
                      >
                        {isColor && (
                          <span 
                            className="border border-gray-200 shrink-0 inline-block shadow-sm"
                            style={{ backgroundColor: colorData.hex, width: '14px', height: '14px', borderRadius: '4px' }}
                          />
                        )}
                        {editingTermIdx === idx ? (
                          <input 
                            type="text" 
                            value={editingTermValue}
                            onChange={(e) => setEditingTermValue(e.target.value)}
                            onBlur={() => handleSaveEditTerm(idx)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTerm(idx)}
                            className="border border-blue-400 rounded px-1 text-[11px] outline-none w-28 bg-white text-slate-850"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onDoubleClick={() => handleStartEditTerm(idx, term)}
                            className="cursor-pointer"
                            title="Double click to edit"
                          >
                            {displayValue}
                          </span>
                        )}
                        
                        <button 
                          onClick={() => handleDeleteTerm(term)}
                          className="p-0.5 hover:bg-red-50 hover:text-red-500 rounded text-gray-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {activeAttribute.terms.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center text-xs text-gray-400 py-6">
                      <Tag size={20} className="text-gray-300 mb-1" />
                      <span>No values defined yet. Add some options below.</span>
                    </div>
                  )}
                </div>

                {/* Add Value Form */}
                {activeAttribute.name === 'color' ? (
                  <form onSubmit={handleAddColorTerm} className="relative flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <div className="flex-grow relative">
                        <input 
                          type="text"
                          placeholder="Type a color name (e.g. Red, Green, etc)..."
                          value={newTermValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewTermValue(val);
                            
                            // Rank prefix matches first, then partial/includes matches
                            const query = val.toLowerCase().trim();
                            if (!query) {
                              setFilteredColors(SUGGESTED_COLORS);
                            } else {
                              const startsWithQ = SUGGESTED_COLORS.filter(c => c.name.toLowerCase().startsWith(query));
                              const includesQ = SUGGESTED_COLORS.filter(c => c.name.toLowerCase().includes(query) && !c.name.toLowerCase().startsWith(query));
                              setFilteredColors([...startsWithQ, ...includesQ]);
                            }
                            setColorDropdownOpen(true);
                          }}
                          onFocus={() => {
                            const query = newTermValue.toLowerCase().trim();
                            if (!query) {
                              setFilteredColors(SUGGESTED_COLORS);
                            } else {
                              const startsWithQ = SUGGESTED_COLORS.filter(c => c.name.toLowerCase().startsWith(query));
                              const includesQ = SUGGESTED_COLORS.filter(c => c.name.toLowerCase().includes(query) && !c.name.toLowerCase().startsWith(query));
                              setFilteredColors([...startsWithQ, ...includesQ]);
                            }
                            setColorDropdownOpen(true);
                          }}
                          onBlur={() => {
                            // Delay closing so dropdown click registers
                            setTimeout(() => setColorDropdownOpen(false), 200);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        
                        {/* Auto-suggest Dropdown */}
                        {colorDropdownOpen && filteredColors.length > 0 && (
                          <div 
                            style={{ top: '100%', marginTop: '4px', zIndex: 100 }}
                            className="absolute left-0 right-0 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-50 custom-scrollbar"
                          >
                            {filteredColors.map((col, cIdx) => (
                              <div 
                                key={cIdx}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevents input blur from firing before state updates
                                  setNewTermValue(col.name);
                                  setSelectedHex(col.hex);
                                  setColorDropdownOpen(false);
                                }}
                                className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="border border-gray-300 shrink-0 inline-block shadow-sm"
                                    style={{ backgroundColor: col.hex, width: '14px', height: '14px', borderRadius: '50%' }}
                                  />
                                  <span className="font-semibold text-gray-800">{col.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{col.hex}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Color Picker Swatch Box */}
                      <div className="relative flex items-center justify-center shrink-0">
                        <input 
                          type="color"
                          value={selectedHex}
                          onChange={(e) => {
                            const newHex = e.target.value.toUpperCase();
                            setSelectedHex(newHex);
                            // Get standard color name from hex using the installed package
                            try {
                              const namedColor = GetColorName(newHex);
                              setNewTermValue(namedColor);
                            } catch (err) {
                              setNewTermValue(newHex);
                            }
                          }}
                          className="w-9 h-9 border border-gray-300 rounded-lg cursor-pointer p-0 bg-transparent overflow-hidden shadow-sm"
                        />
                      </div>

                      <AddBtn type="submit">Add Color</AddBtn>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddTerm} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={`Add new value for ${activeAttribute.name} (e.g. Small, Medium)...`}
                      value={newTermValue}
                      onChange={(e) => setNewTermValue(e.target.value)}
                      className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <AddBtn type="submit">Add Value</AddBtn>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-gray-400">
              {loading ? 'Loading...' : 'Select an attribute from the list to manage its values.'}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          ADD/EDIT ATTRIBUTE DIALOG MODAL
         ========================================== */}
      {attrFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-gray-100 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="bg-[#001E3C] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">
                {editingAttr ? 'Rename Attribute' : 'Add New Attribute'}
              </span>
              <button 
                onClick={() => setAttrFormOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAttribute} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Attribute Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. material, ramsize, color"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white lowercase"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-gray-400">Names are lowercase for matching (e.g. "color", "size").</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                <CancelBtn onClick={() => setAttrFormOpen(false)} />
                <SaveBtn type="submit">Save Changes</SaveBtn>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default Attributes;
