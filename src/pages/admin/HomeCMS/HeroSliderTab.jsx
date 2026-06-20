import React from 'react';
import { ImageIcon, Plus, Upload, Link2 } from 'lucide-react';

const HeroSliderTab = ({ slides, setSlides, addSlide, offerBanners }) => {
  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
       {/* SECTION B: RIGHT SIDE PROMO/OFFERS FIXED PANELS SECTION */}
      <div className="flex flex-col gap-4 border-t border-gray-100">
        <div className="border-b border-gray-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            Right Column Side Offer Banners Configuration
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offerBanners.map((banner, index) => (
            <div key={banner.id} className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-grow flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded w-max text-[10px] font-bold text-slate-600 uppercase">
                  Card Slot Position #{index + 1}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <Link2 size={11} /> Redirection Link Target
                  </label>
                  <input type="text" placeholder="e.g., /category/iphone-deals" className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 bg-gray-50/50 focus:outline-none font-mono" />
                </div>
              </div>
              <div className="w-full md:w-[180px] flex flex-col gap-1 flex-shrink-0">
                <span className="text-[11px] font-bold uppercase text-slate-500">Offer Card Photo</span>
                <div className="border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/50 rounded-lg flex flex-col items-center justify-center text-center p-3 cursor-pointer flex-grow min-h-[130px] transition-all">
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Change Media</span>
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
          {slides.map((slide) => (
            <div key={slide.id} className="w-full border border-gray-200 rounded-xl bg-white/50 p-4 sm:p-5 flex flex-col xl:flex-row gap-5 items-stretch group hover:border-gray-300/80 transition-all">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Title (Main Heading)</label>
                  <input type="text" placeholder="e.g., Boat Headphone" className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slide Sub-Description</label>
                  <input type="text" placeholder="e.g., Taking your Viewing Experience to Next Level" className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Button Text</label>
                  <input type="text" placeholder="e.g., Shop Now" className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Redirect Link URL</label>
                  <input type="text" placeholder="e.g., /category/headphones" className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="w-full xl:w-[280px] flex flex-col gap-1.5 flex-shrink-0">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Slider Image Asset</span>
                <div className="w-full border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-lg bg-gray-50 p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] flex-grow">
                  <Upload size={18} className="text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Upload Background</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
    </div>
  );
};

export default HeroSliderTab;