import React, { useState, useEffect } from 'react';
import { getHomeCMS } from '../api/homeCms'; // Adjust this import path to your actual api file path

const PromoBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannersData = async () => {
      try {
        const res = await getHomeCMS();
        // FIXED: Accessing res.data.offerBanners instead of res.offerBanners
        if (res && res.data && Array.isArray(res.data.offerBanners)) {
          setBanners(res.data.offerBanners);
        }
      } catch (error) {
        console.error("Error fetching promo banners from CMS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannersData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <div className="w-full flex-1 rounded-lg bg-gray-200 animate-pulse min-h-[120px]" />
        <div className="w-full flex-1 rounded-lg bg-gray-200 animate-pulse min-h-[120px]" />
      </div>
    );
  }

  const topBanner = banners[0];
  const bottomBanner = banners[1];

  return (
    <>
      {/* Top Banner Slot */}
      {topBanner ? (
        <div 
          onClick={() => { if(topBanner.btnLink) window.location.href = topBanner.btnLink; }}
          className="w-full flex-1 rounded-lg overflow-hidden relative bg-gradient-to-br from-orange-200 to-orange-400 shadow-sm group cursor-pointer"
        >
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
            style={{
              backgroundImage: topBanner.image ? `url('${topBanner.image}')` : 'none',
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          ></div>
          <div className="relative z-10 p-6 flex flex-col h-full justify-start">
            <p className="text-white font-medium text-sm drop-shadow-sm mb-1 tracking-wide">{topBanner.tagline}</p>
            <h3 className="text-white font-bold text-2xl drop-shadow-md">{topBanner.title}</h3>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs min-h-[120px]">
          Promo Slot 1 Unset
        </div>
      )}

      {/* Bottom Banner Slot */}
      {bottomBanner ? (
        <div 
          onClick={() => { if(bottomBanner.btnLink) window.location.href = bottomBanner.btnLink; }}
          className="w-full flex-1 rounded-lg overflow-hidden relative bg-gradient-to-br from-[#4dd0e1] to-[#009EDB] shadow-sm group cursor-pointer"
        >
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-500 ease-out"
            style={{
              backgroundImage: bottomBanner.image ? `url('${bottomBanner.image}')` : 'none',
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          ></div>
          <div className="relative z-10 p-6 flex flex-col h-full justify-start items-end text-right">
            <p className="text-white font-medium text-sm drop-shadow-sm mb-1 tracking-wide">{bottomBanner.tagline}</p>
            <h3 className="text-white font-bold text-2xl drop-shadow-md">{bottomBanner.title}</h3>
            <span className="text-white text-xs mt-auto underline decoration-white/50 hover:decoration-white transition-colors group-hover:translate-x-[-2px]">
              Shop Now
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs min-h-[120px]">
          Promo Slot 2 Unset
        </div>
      )}
    </>
  );
};

export default PromoBanners;