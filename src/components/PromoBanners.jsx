import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomeCMS } from '../api/homeCms'; // Adjust this import path to your actual api file path

const PromoBanners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannersData = async () => {
      try {
        const res = await getHomeCMS();
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
        <div className="w-full flex-1 rounded-lg bg-gray-100 animate-pulse min-h-[120px]" />
        <div className="w-full flex-1 rounded-lg bg-gray-100 animate-pulse min-h-[120px]" />
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
          onClick={() => {
            if (topBanner.btnLink) {
              if (topBanner.btnLink.startsWith('http://') || topBanner.btnLink.startsWith('https://')) {
                window.location.href = topBanner.btnLink;
              } else {
                navigate(topBanner.btnLink);
              }
            }
          }}
          /* REMOVED: bg-gradient-to-br from-orange-200 to-orange-400 */
          className="w-full flex-1 rounded-lg overflow-hidden relative bg-transparent shadow-sm group cursor-pointer"
        >
          <div 
            /* CHANGED: opacity-100, removed mix-blend-multiply */
            className="absolute inset-0 opacity-100 group-hover:scale-105 transition-transform duration-500 ease-out"
            style={{
              backgroundImage: topBanner.image ? `url('${topBanner.image}')` : 'none',
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          ></div>
          {/* Subtle text shielding layout overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/5 to-transparent z-10" />
          
          <div className="relative z-20 p-6 flex flex-col h-full justify-start">
            <p className="text-white font-medium text-sm mb-1 tracking-wide drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">{topBanner.tagline}</p>
            <h3 className="text-white font-bold text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]">{topBanner.title}</h3>
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
          onClick={() => {
            if (bottomBanner.btnLink) {
              if (bottomBanner.btnLink.startsWith('http://') || bottomBanner.btnLink.startsWith('https://')) {
                window.location.href = bottomBanner.btnLink;
              } else {
                navigate(bottomBanner.btnLink);
              }
            }
          }}
          /* REMOVED: bg-gradient-to-br from-[#4dd0e1] to-[#009EDB] */
          className="w-full flex-1 rounded-lg overflow-hidden relative bg-transparent shadow-sm group cursor-pointer"
        >
          <div 
            /* CHANGED: opacity-100, removed mix-blend-overlay */
            className="absolute inset-0 opacity-100 group-hover:scale-105 transition-transform duration-500 ease-out"
            style={{
              backgroundImage: bottomBanner.image ? `url('${bottomBanner.image}')` : 'none',
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          ></div>
          {/* Subtle text shielding layout overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/5 to-transparent z-10" />
          
          <div className="relative z-20 p-6 flex flex-col h-full justify-start items-end text-right">
            <p className="text-white font-medium text-sm mb-1 tracking-wide drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">{bottomBanner.tagline}</p>
            <h3 className="text-white font-bold text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]">{bottomBanner.title}</h3>
           
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