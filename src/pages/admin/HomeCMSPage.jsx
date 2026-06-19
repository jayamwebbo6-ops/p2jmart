import React, { useState } from 'react';
import { 
  Sliders, 
  Grid, 
  Star, 
  FileText, 
  ShieldAlert, 
  Lock, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  Image as ImageIcon, 
  MoveUp, 
  MoveDown,
  CheckCircle,
  Tag,
  Link2
} from 'lucide-react';

const HomeContentManager = () => {
  const [activeTab, setActiveTab] = useState('hero-slider');
  const [showToast, setShowToast] = useState(false);

  // 1. Slider Configuration State Mapping (Left Layout block from image_4ae497.jpg)
  const [slides, setSlides] = useState([
    { 
      id: 1, 
      title: "Boat Headphone", 
      description: "Taking your Viewing Experience to Next Level", 
      btnLabel: "Shop Now",
      btnLink: "/category/headphones",
      image: null 
    },
    { 
      id: 2, 
      title: "SNAP ART Spotify Frame", 
      description: "Personalized scannable frame tokens with live musical elements", 
      btnLabel: "Customize Now",
      btnLink: "/product/custom-spotify-frame",
      image: null 
    }
  ]);

  // 2. Separate Dynamic Promo Offers Banner State (Right Side Layout cards from image_4ae497.jpg)
  const [offerBanners, setOfferBanners] = useState([
    {
      id: 101,
      tagline: "iPhone Collection",
      title: "25% OFF",
      btnLink: "/category/iphone-cases",
      image: null
    },
    {
      id: 102,
      tagline: "MAC Computer",
      title: "25% OFF",
      btnLink: "/category/macbook-stands",
      image: null
    }
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Gifts", image: null },
    { id: 2, name: "Frames", image: null },
    { id: 3, name: "Customized Plaque", image: null }
  ]);

  const handleSaveChanges = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const deleteSlide = (id) => setSlides(slides.filter(s => s.id !== id));
  const addSlide = () => setSlides([...slides, { id: Date.now(), title: "", description: "", btnLabel: "Shop Now", btnLink: "", image: null }]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 font-['Inter'] antialiased text-gray-800 p-4 sm:p-6 md:p-8 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-sm font-semibold tracking-wide transition-all animate-bounce">
          <CheckCircle size={18} />
          <span>saved changes Successfully!</span>
        </div>
      )}

      {/* Top Controller Header Dashboard Card */}
      <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mb-6 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Home Content Manager
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 mt-0.5">
            Customize your storefront experience statically. Manage banners, asset layouts, and system metadata profiles.
          </p>
        </div>
        <button 
          onClick={handleSaveChanges}
          className="bg-secondary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold tracking-wider text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] self-stretch sm:self-center"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Primary Tabs Shell */}
      <div className="w-full max-w-[1600px] mx-auto bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation Ribbon */}
        <div className="w-full border-b border-gray-100 bg-gray-50/40 flex items-center gap-1 overflow-x-auto scrollbar-none px-4 pt-3">
          {[
            { id: 'hero-slider', label: 'Hero Slider Layout', icon: Sliders },
            { id: 'category-grid', label: 'Category Grid', icon: Grid },
            { id: 'featured-products', label: 'Featured Products', icon: Star },
            { id: 'privacy-policy', label: 'Privacy Policy', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-t-2 border-x rounded-t-xl whitespace-nowrap -mb-[1px] ${
                  isActive 
                    ? 'bg-white border-gray-200 border-t-primary text-[#A30D22] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#A30D22]' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Inner Content Area */}
        <div className="p-5 sm:p-6 md:p-8 flex-1 w-full min-w-0">
          
          {activeTab === 'hero-slider' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              
              {/* Contextual Sizing Advisory Banner */}
              <div className="w-full bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-secondary text-white p-1.5 rounded-lg flex-shrink-0 mt-0.5">
                  <ImageIcon size={16} />
                </div>
                <div className="text-xs sm:text-sm">
                  <h4 className="font-bold text-primary tracking-wide">Recommended Viewport Proportions</h4>
                  <span className="text-secondary mt-0.5 leading-relaxed">
                  For a perfect full-width fit, upload images of size <span className='text-red-500'>1920 x 500</span> pixels. Ensure your main subjects are centered to avoid being cut on mobile.
                  </span>
                </div>
              </div>

              {/* SECTION A: LEFT SIDE MAIN SLIDER ROWS CONTAINER */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 flex-wrap gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    Left Carousel Slides ({slides.length})
                  </h3>
                  <button 
                    onClick={addSlide}
                    className="bg-primary cursor-pointer hover:bg-secondary text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add New Slide
                  </button>
                </div>

               <div className="flex flex-col gap-5">
  {slides.map((slide, index) => (
    <div key={slide.id} className="w-full border border-gray-200 rounded-xl bg-white/50 p-4 sm:p-5 flex flex-col xl:flex-row gap-5 items-stretch group hover:border-gray-300/80 transition-all">
      
      {/* Meta Inputs Segment Block */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Slide Title Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Title (Main Heading)</label>
          <input 
            type="text" 
           
            placeholder="e.g., Boat Headphone" 
            className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Slide Sub-Description Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Sub-Description</label>
          <input 
            type="text" 
            placeholder="e.g., Taking your Viewing Experience to Next Level" 
            className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Action Button Text Input + Live Preview Badge */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Button Text</label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input 
              type="text" 
            
              placeholder="e.g., Shop Now" 
              className="flex-grow border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          
          </div>
        </div>

        {/* Action Redirect Link URL Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Redirect Link URL</label>
          <input 
            type="text" 
            
            placeholder="e.g., /category/headphones" 
            className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Image Form Frame */}
      <div className="w-full xl:w-[280px] flex flex-col gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slider Image Asset</span>
        <div className="w-full border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-lg bg-gray-50 p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] flex-grow">
          <Upload size={18} className="text-gray-400 mb-1" />
          <span className="text-xs font-semibold text-slate-700">Upload Background</span>
          <span className="text-[9px] text-gray-400 mt-0.5">landscape layout style (e.g., image_4ae497.jpg)</span>
        </div>
      </div>

      
    </div>
  ))}
</div>
              </div>

              {/* SECTION B: RIGHT SIDE PROMO/OFFERS FIXED PANELS SECTION */}
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                     Right Column Side Offer Banners Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {offerBanners.map((banner, index) => (
                    <div key={banner.id} className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col md:flex-row gap-4 items-stretch">
                      
                      {/* Form Metadata */}
                      <div className="flex-grow flex flex-col gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded w-max text-[10px] font-bold text-slate-600 uppercase">
                          Card Slot Position #{index + 1}
                        </div>
                        
                       

                       

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                            <Link2 size={11} /> Redirection Link Target
                          </label>
                          <input 
                            type="text"
                          
                            placeholder="e.g., /category/iphone-deals"
                            className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 bg-gray-50/50 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Offer Graphic Asset Input container box */}
                      <div className="w-full md:w-[180px] flex flex-col gap-1 flex-shrink-0">
                        <span className="text-[11px] font-bold uppercase text-slate-500">Offer Card Photo</span>
                        <div className="border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/50 rounded-lg flex flex-col items-center justify-center text-center p-3 cursor-pointer flex-grow min-h-[130px] transition-all">
                          <Upload size={16} className="text-gray-400 mb-1" />
                          <span className="text-[10px] font-bold text-slate-700 uppercase">Change Media</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Aspect Ratio: Square / Card Layout</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FRONTPAGE CATEGORIES CONFIGURATION PANELS */}
          {activeTab === 'category-grid' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Featured Home Categories ({categories.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="border border-gray-200 bg-white rounded-xl p-4 flex gap-4 items-center shadow-sm">
                    <div className="w-16 h-16 border border-dashed border-gray-300 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer flex-shrink-0 hover:bg-gray-100 transition-colors">
                      <Upload size={14} />
                      <span className="text-[9px] font-bold mt-1 uppercase">Upload</span>
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Category Display Name</label>
                      <input 
                        type="text" 
                        value={cat.name} 
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx].name = e.target.value;
                          setCategories(updated);
                        }}
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs sm:text-sm font-semibold text-slate-800 bg-gray-50/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FEATURED PRODUCT MATRICES */}
          {activeTab === 'featured-products' && (
            <div className="flex flex-col gap-5 text-center py-12 text-gray-400 animate-fadeIn">
              <Star size={32} className="mx-auto mb-1 stroke-[1.5]" />
              <h4 className="font-bold text-slate-800 text-sm uppercase">Featured Products Link Map</h4>
              <p className="text-xs max-w-sm mx-auto font-medium">
                Link system product elements seamlessly to your frontpage matrix grid configurations by mapping target SKU identifiers.
              </p>
            </div>
          )}

          {/* TABS 4, 5, 6: RICH LEGAL CONTENT TEXT EDITOR AREAS */}
          {['return-policy', 'terms-conditions', 'privacy-policy'].includes(activeTab) && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  {activeTab.replace('-', ' ')} Editor Console
                </h3>
                <p className="text-xs text-gray-400">Draft rich legal content disclosures to project on static legal pages.</p>
              </div>
              <textarea 
                rows={12}
                placeholder={`Provide exhaustive textual definitions layout instructions for global context fields: ${activeTab.replace('-', ' ')}...`}
                className="w-full border border-gray-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HomeContentManager;