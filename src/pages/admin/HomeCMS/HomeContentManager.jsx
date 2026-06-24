import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  Grid, 
  Star,
  CheckCircle,
  LayoutGrid,
  Contact,
  Shield,
  RotateCcw,
  Truck,
  SquareCode,
  AlertCircle
} from 'lucide-react';
import { SaveBtn } from '../../../components/AdminButtons';
import PageHeader from '../../../components/PageHeader';
import { getHomeCMS, updateHomeCMS } from '../../../api/homeCms';

// Import Your Split Sub-Components
import HeroSliderTab from './HeroSliderTab';
import CategoryGridTab from './CategoryGridTab';
import CategoryTab from './CategoryTab';
import MultiShowCaseTab from './MultiColumnShowcaseTab';
import ContactSetting from './Contact';
import PrivacyPolicyManager from './PrivacyPolicyManager';
import CancellationReturnPolicyManager from './CancellationReturnPolicyHandle';
import DeliveryPolicyManager from './DeliveryPolicyManager';
import TermsCondition from './TermsCondition';


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
  const [slides, setSlides] = useState([]);
  const [offerBanners, setOfferBanners] = useState([]);
  const [categoryGrid, setCategoryGrid] = useState([]);
  const [categorySections, setCategorySections] = useState([]);
  const [promoBanner, setPromoBanner] = useState({ imgUrl: '', targetUrl: '/offers/mega-sale' });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [exclusiveProducts, setExclusiveProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Gifts", image: null },
    { id: 2, name: "Frames", image: null },
    { id: 3, name: "Customized Plaque", image: null }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('Saved changes successfully!');
  const [toastType, setToastType] = useState('success');

  // Fetch from DB on mount
  useEffect(() => {
    const fetchCMS = async () => {
      try {
        setIsLoading(true);
        const data = await getHomeCMS();
        if (data && data.success) {
          const cmsData = data.data;
          setSlides(
            (cmsData.heroSlider || []).map((slide, idx) => ({
              ...slide,
              id: slide._id || slide.id || `slide-${idx}-${Date.now()}`
            }))
          );
          setOfferBanners(
            (cmsData.offerBanners || []).map((banner, idx) => ({
              ...banner,
              id: banner._id || banner.id || `offer-${idx}-${Date.now()}`
            }))
          );
          setCategoryGrid(
            (cmsData.categoryGrid || []).map((card, idx) => ({
              ...card,
              id: card._id || card.id || `card-${idx}-${Date.now()}`
            }))
          );
          setPromoBanner(cmsData.promoBanner || { imgUrl: '', targetUrl: '/offers/mega-sale' });
          setCategorySections(
            (cmsData.categorySections || []).map((section, idx) => ({
              ...section,
              id: section._id || section.id || `sec-${idx}-${Date.now()}`
            }))
          );
          setFeaturedProducts(cmsData.featuredProducts || []);
          setTrendingProducts(cmsData.trendingProducts || []);
          setExclusiveProducts(cmsData.exclusiveProducts || []);
        }
      } catch (err) {
        console.error('Fetch Home CMS error:', err);
        setToastMessage('Error loading homepage settings.');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCMS();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const data = await updateHomeCMS({
        heroSlider: slides,
        offerBanners: offerBanners,
        categoryGrid: categoryGrid,
        categorySections: categorySections,
        promoBanner: promoBanner,
        featuredProducts,
        trendingProducts,
        exclusiveProducts
      });
      if (data && data.success) {
        const cmsData = data.data;
        setSlides(
          (cmsData.heroSlider || []).map((slide, idx) => ({
            ...slide,
            id: slide._id || slide.id || `slide-${idx}-${Date.now()}`
          }))
        );
        setOfferBanners(
          (cmsData.offerBanners || []).map((banner, idx) => ({
            ...banner,
            id: banner._id || banner.id || `offer-${idx}-${Date.now()}`
          }))
        );
        setCategoryGrid(
          (cmsData.categoryGrid || []).map((card, idx) => ({
            ...card,
            id: card._id || card.id || `card-${idx}-${Date.now()}`
          }))
        );
        setPromoBanner(cmsData.promoBanner || { imgUrl: '', targetUrl: '/offers/mega-sale' });
        setCategorySections(
          (cmsData.categorySections || []).map((section, idx) => ({
            ...section,
            id: section._id || section.id || `sec-${idx}-${Date.now()}`
          }))
        );
        setFeaturedProducts(cmsData.featuredProducts || []);
        setTrendingProducts(cmsData.trendingProducts || []);
        setExclusiveProducts(cmsData.exclusiveProducts || []);
        setToastMessage('Saved changes successfully!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('Save Home CMS error:', err);
      setToastMessage(err.response?.data?.message || 'Failed to save homepage settings.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addSlide = () => setSlides([...slides, { id: `slide-new-${Date.now()}`, title: "", description: "", btnLabel: "Shop Now", btnLink: "", image: null }]);

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-6 right-6 ${toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-sm font-semibold tracking-wide transition-all animate-bounce`}>
          {toastType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        title="Home Content Manager"
        subtitle="Customize your storefront experience. Manage banners, asset layouts, and metadata profiles."
      >
        <SaveBtn onClick={handleSaveChanges} type="button" disabled={isSaving || isLoading}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </SaveBtn>
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
              { id: 'termsConditions', label: 'Terms Conditions', icon:SquareCode,  }
              
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
          
          {isLoading ? (
            <div className="flex flex-col gap-6 py-12 items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs font-semibold uppercase tracking-wider">Loading settings...</span>
            </div>
          ) : (
            <>
              {activeTab === 'hero-slider' && (
                <HeroSliderTab 
                  slides={slides} 
                  setSlides={setSlides} 
                  addSlide={addSlide} 
                  offerBanners={offerBanners} 
                  setOfferBanners={setOfferBanners}
                />
              )}

              {activeTab === 'category-grid' && (
                <CategoryGridTab 
                  cards={categoryGrid} 
                  setCards={setCategoryGrid} 
                  promoBanner={promoBanner}
                  setPromoBanner={setPromoBanner}
                />
              )}

              {activeTab === 'featured-products' && (
                <CategoryTab 
                  sections={categorySections} 
                  setSections={setCategorySections} 
                />
              )}
            </>
          )}

          {activeTab === 'multiColumnShowcase' && (
            <MultiShowCaseTab
              featuredProducts={featuredProducts}
              setFeaturedProducts={setFeaturedProducts}
              trendingProducts={trendingProducts}
              setTrendingProducts={setTrendingProducts}
              exclusiveProducts={exclusiveProducts}
              setExclusiveProducts={setExclusiveProducts}
            />
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

           {activeTab === 'termsConditions' && (
            <TermsCondition/>
          )}
 

        </div>
      </div>
    </div>
  );
};

export default HomeContentManager;