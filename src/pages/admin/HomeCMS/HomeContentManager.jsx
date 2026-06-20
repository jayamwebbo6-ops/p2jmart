import React, { useState } from 'react';
import { 
  Sliders, 
  Grid, 
  Star, 
  FileText, 
  ShieldAlert, 
  Lock, 
  Save, 
  CheckCircle ,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

// Import Your Split Sub-Components
import HeroSliderTab from './HeroSliderTab';
import CategoryGridTab from './CategoryGridTab';
import FeaturedProductsTab from './FeaturedProductsTab';
import MultiShowCaseTab from './MultiColumnShowcaseTab'

const HomeContentManager = () => {
  const [activeTab, setActiveTab] = useState('hero-slider');
  const [showToast, setShowToast] = useState(false);

  // Consolidated Parent States
  const [slides, setSlides] = useState([
    { id: 1, title: "Boat Headphone", description: "Taking your Viewing Experience to Next Level", btnLabel: "Shop Now", btnLink: "/category/headphones", image: null },
    { id: 2, title: "SNAP ART Spotify Frame", description: "Personalized scannable frame tokens with live musical elements", btnLabel: "Customize Now", btnLink: "/product/custom-spotify-frame", image: null }
  ]);

  const [offerBanners, setOfferBanners] = useState([
    { id: 101, tagline: "iPhone Collection", title: "25% OFF", btnLink: "/category/iphone-cases", image: null },
    { id: 102, tagline: "MAC Computer", title: "25% OFF", btnLink: "/category/macbook-stands", image: null }
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
            { id: 'multiColumnShowcase', label: 'multiColumnShowcase', icon: LayoutGrid },

          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-t-2 border-x rounded-t-xl whitespace-nowrap -mb-[1px] ${
                  isActive 
                    ? 'bg-white border-gray-200 border-t-primary text-primary shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-secondary' : 'text-primary'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Route/Tab Content Switcher Area */}
        <div className="p-5 sm:p-6 md:p-8 flex-1 w-full min-w-0">
          
          {activeTab === 'hero-slider' && (
            <HeroSliderTab 
              slides={slides} 
              setSlides={setSlides} 
              addSlide={addSlide} 
              offerBanners={offerBanners} 
            />
          )}

          {activeTab === 'category-grid' && (
            <CategoryGridTab 
              categories={categories} 
              setCategories={setCategories} 
            />
          )}

          {activeTab === 'featured-products' && (
            <FeaturedProductsTab />
          )}

          {activeTab === 'multiColumnShowcase' && (
            <MultiShowCaseTab/>
          )}

          {/* Legal Pages Rich Editors */}
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