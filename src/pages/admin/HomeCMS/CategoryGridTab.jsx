import React, { useRef } from 'react';
import { Upload, Trash2, Plus } from 'lucide-react';

// Theme configuration matching the exact palette tokens from the layout architecture
const THEME = {
  primaryBg: 'bg-[#002B49]',
  primaryText: 'text-[#002B49]',
  primaryHover: 'hover:bg-[#001F35]',
  primaryBorder: 'border-[#002B49]',
  secondaryBg: 'bg-[#F0F8FF]', 
  secondaryText: 'text-[#006699]',
  secondaryBorder: 'border-[#CCE5FF]',
  mutedText: 'text-[#64748b]',
  inputBg: 'bg-white',
};

const CategoryGridTab = ({ cards, setCards }) => {
  const fileInputRefs = useRef({});

  const handleFieldChange = (id, field, value) => {
    setCards(cards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const handleAddNewCategory = () => {
    const newCard = {
      id: `card-new-${Date.now()}`,
      title: "",
      description: "",
      buttonText: "View Collection",
      targetUrl: "",
      image: ""
    };
    setCards([...cards, newCard]);
  };

  const handleRemoveCategoryCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const handleImageUpload = (id, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFieldChange(id, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (id) => {
    handleFieldChange(id, 'image', '');
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-6">

      {/* SUBHEADLINE CONTROL BAR CONTAINER FOR SLIDES */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          Category Grid Cards ({cards.length})
        </h3>

        <button
          type="button"
          onClick={handleAddNewCategory}
          className={`${THEME.primaryBg} ${THEME.primaryHover} text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer`}
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Add New Card</span>
        </button>
      </div>

      {/* HORIZONTAL CAROUSEL CONFIGURATION STACK */}
      <div className="space-y-5">
        {cards.map((card, index) => (
          <div key={card.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs relative group">
            
            {/* Position badge */}
            <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded w-max text-[10px] font-bold text-slate-600 uppercase mb-4">
              Card Slot #{index + 1}
            </div>

            {/* Top row controls inside card container */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => handleRemoveCategoryCard(card.id)}
                className="text-slate-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Split row setup: Left controls parameters vs right image box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT BLOCK: INPUT FORM PANEL GRID SYSTEM */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* FIELD 1: CARD TITLE */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Title (Main Heading)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., Gift Boxes"
                    value={card.title || ''}
                    onChange={(e) => handleFieldChange(card.id, 'title', e.target.value)}
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition-all`}
                  />
                </div>

                {/* FIELD 2: CARD DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Sub-Description
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., Curated collections of premium essentials"
                    value={card.description || ''}
                    onChange={(e) => handleFieldChange(card.id, 'description', e.target.value)}
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition-all`}
                  />
                </div>

                {/* FIELD 3: ACTION BUTTON TEXT */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Action Button Text
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., View Collection"
                    value={card.buttonText || ''}
                    onChange={(e) => handleFieldChange(card.id, 'buttonText', e.target.value)}
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition-all`}
                  />
                </div>

                {/* FIELD 4: ACTION REDIRECT LINK URL */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Action Redirect Link URL
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., /category/gift-boxes"
                    value={card.targetUrl || ''}
                    onChange={(e) => handleFieldChange(card.id, 'targetUrl', e.target.value)}
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-500 focus:outline-none transition-all`}
                  />
                </div>

              </div>

              {/* RIGHT BLOCK: IMAGE UPLOADER BAY */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  Category Image Asset
                </label>

                <div 
                  onClick={() => fileInputRefs.current[`cat-${card.id}`]?.click()}
                  className="w-full h-[108px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center group/img transition-colors hover:bg-slate-100/60 cursor-pointer"
                >
                  {card.image ? (
                    <>
                      <img src={card.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <Upload size={16} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Change Image</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClearImage(card.id); }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 p-1.5 rounded-lg shadow-sm border border-slate-200/60 transition-colors cursor-pointer z-10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center justify-center gap-1 text-slate-400">
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-700">Upload Background</span>
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={el => fileInputRefs.current[`cat-${card.id}`] = el}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleImageUpload(card.id, e)} 
                    className="hidden" 
                  />
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {cards.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-3xs">
          <p className="text-xs font-black text-slate-400 tracking-widest uppercase">No Active Category Grid Cards Found</p>
          <button 
            onClick={handleAddNewCategory} 
            className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${THEME.secondaryText} hover:underline cursor-pointer`}
          >
            Click here to add the first category card
          </button>
        </div>
      )}

    </div>
  );
};

export default CategoryGridTab;