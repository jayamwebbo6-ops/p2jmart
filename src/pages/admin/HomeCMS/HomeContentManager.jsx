import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Grid, 
  Star,
  CheckCircle,
  LayoutGrid,
  Contact,
  Shield,
  RotateCcw,
  Truck
} from 'lucide-react';
import { SaveBtn } from '../../../components/AdminButtons';
import PageHeader from '../../../components/PageHeader';

// Import Your Split Sub-Components
import HeroSliderTab from './HeroSliderTab';
import CategoryGridTab from './CategoryGridTab';
import CategoryTab from './CategoryTab';
import MultiShowCaseTab from './MultiColumnShowcaseTab';
import ContactSetting from './Contact';
import PrivacyPolicyManager from './PrivacyPolicyManager';
import CancellationReturnPolicyManager from './CancellationReturnPolicyHandle';
import DeliveryPolicyManager from './DeliveryPolicyManager';


const HomeContentManager = () => {
  const [activeTab, setActiveTab] = useState('hero-slider');
  const [showToast, setShowToast] = useState(false);

  // Drag-to-scroll implementation
  const tabsContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - tabsContainerRef.current.offsetLeft;
    scrollLeft.current = tabsContainerRef.current.scrollLeft;
    hasMoved.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 3) {
      hasMoved.current = true;
    }
    tabsContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTabClick = (e, tabId) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setActiveTab(tabId);
  };

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
    <div className="w-full text-slate-800 antialiased min-h-screen">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-sm font-semibold tracking-wide transition-all animate-bounce">
          <CheckCircle size={18} />
          <span>Saved changes successfully!</span>
        </div>
      )}

      <PageHeader
        title="Home Content Manager"
        subtitle="Customize your storefront experience. Manage banners, asset layouts, and metadata profiles."
      >
        <SaveBtn onClick={handleSaveChanges} type="button">Save Changes</SaveBtn>
      </PageHeader>

      {/* Primary Tabs Shell */}
      <div className="w-full max-w-[1600px] mx-auto bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation Ribbon - Fixed to support seamless swiping/scrolling */}
        <div 
          ref={tabsContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="w-full border-b border-gray-100 bg-gray-50/40 overflow-x-auto overflow-y-hidden min-w-full select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-1 px-4 pt-3 w-max min-w-full">
            {[
              { id: 'hero-slider', label: 'Hero Slider Layout', icon: Sliders },
              { id: 'category-grid', label: 'Category Grid', icon: Grid },
              { id: 'featured-products', label: 'Category Sections', icon: Star },
              { id: 'multiColumnShowcase', label: 'multiColumnShowcase', icon: LayoutGrid },
              { id: 'contactSetting', label: 'Contact Setting', icon: Contact },
              { id: 'privacyPolicy', label: 'Privacy Policy', icon: Shield },
              { id: 'cancellationReturnPolicy', label: 'Cancellation & Returns', icon: RotateCcw },
              { id: 'deliveryPolicy', label: 'Delivery Policy', icon: Truck },

            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => handleTabClick(e, tab.id)}
                  type="button"
                  className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold transition-all border-t-2 border-x rounded-t-xl whitespace-nowrap -mb-[1px] select-none ${
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
        </div>

        {/* Dynamic Route/Tab Content Switcher Area */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 w-full min-w-0">
          
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
            <CategoryTab />
          )}

          {activeTab === 'multiColumnShowcase' && (
            <MultiShowCaseTab/>
          )}

          {activeTab === 'contactSetting' && (
            <ContactSetting/>
          )}

          {activeTab === 'privacyPolicy' && (
            <PrivacyPolicyManager />
          )}

          {activeTab === 'cancellationReturnPolicy' && (
            <CancellationReturnPolicyManager />
          )}
          
          {activeTab === 'deliveryPolicy' && (
            <DeliveryPolicyManager/>
          )}
 

        </div>
      </div>
    </div>
  );
};

export default HomeContentManager;