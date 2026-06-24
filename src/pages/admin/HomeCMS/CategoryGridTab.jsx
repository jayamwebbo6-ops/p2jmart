import React, { useState } from 'react';
import { Link2, Type, FileText, Image as ImageIcon, Upload, ArrowRight, Trash2, Plus, Info } from 'lucide-react';

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

const INITIAL_LAYOUT_CARDS = [
  {
    id: 1,
    positionLabel: "SLIDE 1",
    title: "Premium Boat Headphone",
    description: "Taking your Viewing Experience to the next dimension with premium noise cancellation setups.",
    buttonName: "Shop Now",
    targetUrl: "/category/headphones",
    imgUrl: ""
  },
  {
    id: 2,
    positionLabel: "SLIDE 2",
    title: "Smartwatches Elite",
    description: "Track your vitals daily with ultra crisp resolution wearable panels.",
    buttonName: "Explore More",
    targetUrl: "/category/smartwatches",
    imgUrl: ""
  }
];

const CategoryGridTab = () => {
  const [cards, setCards] = useState(INITIAL_LAYOUT_CARDS);
  
  // Isolated state for managing the right-side standalone promotional ad banner from image_3c72c7.jpg
  const [promoBanner, setPromoBanner] = useState({
    imgUrl: "",
    targetUrl: "/offers/mega-sale"
  });

  const handleFieldChange = (id, field, value) => {
    setCards(cards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const handleAddNewCategory = () => {
    const nextId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
    const newCard = {
      id: nextId,
      positionLabel: `SLIDE ${nextId}`,
      title: "",
      description: "",
      buttonName: "",
      targetUrl: "",
      imgUrl: ""
    };
    setCards([...cards, newCard]);
  };

  const handleRemoveCategoryCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const handleImageUpload = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const temporaryUrl = URL.createObjectURL(file);
      handleFieldChange(id, 'imgUrl', temporaryUrl);
    }
  };

  const handleClearImage = (id) => {
    handleFieldChange(id, 'imgUrl', '');
  };

  // Promo Banner Handler Methods
  const handlePromoImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const temporaryUrl = URL.createObjectURL(file);
      setPromoBanner(prev => ({ ...prev, imgUrl: temporaryUrl }));
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-6">
      


      {/* DEDICATED MANAGEMENT SECTION: RIGHT SIDE BANNER AD (Ref: image_3c72c7.jpg Rightmost Panel) */}
      

      {/* SUBHEADLINE CONTROL BAR CONTAINER FOR SLIDES */}
      <div className="flex justify-between items-center pt-2">
       

        <button
          type="button"
          onClick={handleAddNewCategory}
          className={`${THEME.primaryBg} ${THEME.primaryHover} text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer`}
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* HORIZONTAL CAROUSEL CONFIGURATION STACK */}
      <div className="space-y-5">
        {cards.map((card) => (
          <div key={card.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs relative group">
            
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
                
                {/* FIELD 1: SLIDE TITLE */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Title (Main Heading)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., Boat Headphone"
                  
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition-all`}
                  />
                </div>

                {/* FIELD 2: SLIDE SUB-DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Sub-Description
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., Taking your Viewing Experience to Next Level"
                  
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
                    placeholder="e.g., Shop Now"
                   
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
                    placeholder="e.g., /category/headphones"
                    
                    className={`w-full ${THEME.inputBg} border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-500 focus:outline-none transition-all`}
                  />
                </div>

              </div>

              {/* RIGHT BLOCK: HORIZONTAL ALIGNED IMAGE UPLOADER BAY */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  Category Image Asset
                </label>

                <div className="w-full h-[108px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center group transition-colors hover:bg-slate-100/60">
                  {card.imgUrl ? (
                    <>
                      <img src={card.imgUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleClearImage(card.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 p-1.5 rounded-lg shadow-sm border border-slate-200/60 transition-colors cursor-pointer"
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

                  <label className="absolute inset-0 cursor-pointer opacity-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(card.id, e)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {cards.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-3xs">
          <p className="text-xs font-black text-slate-400 tracking-widest uppercase">No Active Dynamic Slides Found</p>
          <button 
            onClick={handleAddNewCategory} 
            className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${THEME.secondaryText} hover:underline`}
          >
            Click here to initialize slide array row elements
          </button>
        </div>
      )}

    </div>
  );
};

export default CategoryGridTab;