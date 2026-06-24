import React, { useRef } from 'react';
import { Plus, Upload, Link2, Trash2 } from 'lucide-react';

const HeroSliderTab = ({ slides, setSlides, addSlide, offerBanners, setOfferBanners }) => {
  const fileInputRefs = useRef({});

  const handleSlideChange = (id, field, value) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleOfferBannerChange = (id, field, value) => {
    setOfferBanners(offerBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleFileChange = (id, field, e, isSlide = true) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isSlide) {
        handleSlideChange(id, field, reader.result);
      } else {
        handleOfferBannerChange(id, field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteSlide = (id) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* SECTION B: RIGHT SIDE PROMO/OFFERS FIXED PANELS SECTION */}
      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
        <div className="border-b border-gray-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            Right Column Side Offer Banners Configuration
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offerBanners.map((banner, index) => (
            <div key={banner.id || index} className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col md:flex-row gap-4 items-stretch shadow-sm">
              <div className="flex-grow flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded w-max text-[10px] font-bold text-slate-600 uppercase">
                  Card Slot Position #{index + 1}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Banner Title / Deal</label>
                  <input 
                    type="text" 
                    value={banner.title || ''}
                    onChange={(e) => handleOfferBannerChange(banner.id, 'title', e.target.value)}
                    placeholder="e.g., 25% OFF" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Tagline / Subtext</label>
                  <input 
                    type="text" 
                    value={banner.tagline || ''}
                    onChange={(e) => handleOfferBannerChange(banner.id, 'tagline', e.target.value)}
                    placeholder="e.g., iPhone Collection" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <Link2 size={11} /> Redirection Link Target
                  </label>
                  <input 
                    type="text" 
                    value={banner.btnLink || ''}
                    onChange={(e) => handleOfferBannerChange(banner.id, 'btnLink', e.target.value)}
                    placeholder="e.g., /category/iphone-deals" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                  />
                </div>
              </div>
              <div className="w-full md:w-[180px] flex flex-col gap-1 flex-shrink-0">
                <span className="text-[11px] font-bold uppercase text-slate-500">Offer Card Photo</span>
                <div 
                  onClick={() => fileInputRefs.current[`offer-${banner.id}`]?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/50 rounded-lg flex flex-col items-center justify-center text-center p-3 cursor-pointer flex-grow min-h-[130px] transition-all relative overflow-hidden group"
                >
                  {banner.image ? (
                    <>
                      <img src={banner.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={16} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Change Media</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-gray-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase">Upload Image</span>
                    </>
                  )}
                  <input 
                    type="file"
                    ref={el => fileInputRefs.current[`offer-${banner.id}`] = el}
                    onChange={(e) => handleFileChange(banner.id, 'image', e, false)}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          ))}
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
          {slides.map((slide, idx) => (
            <div key={slide.id || idx} className="w-full border border-gray-200 rounded-xl bg-white/50 p-4 sm:p-5 flex flex-col xl:flex-row gap-5 items-stretch group hover:border-gray-300/80 transition-all relative">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Title (Main Heading)</label>
                  <input 
                    type="text" 
                    value={slide.title || ''}
                    onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                    placeholder="e.g., Boat Headphone" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Sub-Description</label>
                  <input 
                    type="text" 
                    value={slide.description || ''}
                    onChange={(e) => handleSlideChange(slide.id, 'description', e.target.value)}
                    placeholder="e.g., Taking your Viewing Experience to Next Level" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Button Text</label>
                  <input 
                    type="text" 
                    value={slide.btnLabel || ''}
                    onChange={(e) => handleSlideChange(slide.id, 'btnLabel', e.target.value)}
                    placeholder="e.g., Shop Now" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Redirect Link URL</label>
                  <input 
                    type="text" 
                    value={slide.btnLink || ''}
                    onChange={(e) => handleSlideChange(slide.id, 'btnLink', e.target.value)}
                    placeholder="e.g., /category/headphones" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="w-full xl:w-[280px] flex flex-col gap-1.5 flex-shrink-0">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slider Image Asset</span>
                <div 
                  onClick={() => fileInputRefs.current[`slide-${slide.id}`]?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-lg bg-gray-50 p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] flex-grow relative overflow-hidden group/img"
                >
                  {slide.image ? (
                    <>
                      <img src={slide.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <Upload size={18} className="mb-1" />
                        <span className="text-xs font-semibold">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Upload Background</span>
                    </>
                  )}
                  <input 
                    type="file"
                    ref={el => fileInputRefs.current[`slide-${slide.id}`] = el}
                    onChange={(e) => handleFileChange(slide.id, 'image', e, true)}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
              
              {/* Delete slide button */}
              <button
                type="button"
                onClick={() => deleteSlide(slide.id)}
                className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Slide"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSliderTab;