import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, Plus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import useThrottledCallback from '../../hooks/useThrottledCallback';
import { toast } from '../../components/toast';
import { isUserAuthenticated } from '../../api/userApi';

const ComboSection = ({ product, combos, selectedColor, selectedSize, onAddToCart, formatImageUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeComboId, setActiveComboId] = useState(null);
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [selectionsByCombo, setSelectionsByCombo] = useState({});
  const remainingCombosRef = useRef(null);

  // 1. Find EVERY active combo containing this product
  const matchedCombos = useMemo(() => {
    if (!product || !combos || combos.length === 0) return [];
    const currentProdId = product.id;
    return combos.filter(c =>
      c.status !== false &&
      c.selectedItemIds?.some(item => (item._id || item.id || item) === currentProdId)
    );
  }, [combos, product]);

  // 2. Build display data for every matched combo
  const combosData = useMemo(() => {
    if (!product || matchedCombos.length === 0) return [];

    return matchedCombos.map(matchedCombo => {
      // Loop over selectedVariants if available, otherwise fallback to selectedItemIds
      const variantList = (matchedCombo.selectedVariants && matchedCombo.selectedVariants.length > 0)
        ? matchedCombo.selectedVariants
        : (matchedCombo.selectedItemIds || []).map(item => ({
            productId: item._id || item.id || item,
            variantId: 'default'
          }));

      const items = variantList.map((sv, idx) => {
        const prodId = sv.productId?._id || sv.productId?.id || sv.productId;
        const item = (matchedCombo.selectedItemIds || []).find(
          p => p && (p._id || p.id || p) === prodId
        );
        if (!item) return null;

        const isCurrent = (item._id || item.id) === product.id;
        
        let resolvedPrice = item.price || 0;
        let resolvedWeight = item.weight || 0;
        let resolvedImage = item.image || '';
        let resolvedTitle = item.title;

        // Try to match the exact variant
        if (item.variants && item.variants.length > 0) {
          const variant = item.variants.find(v => v.id === sv.variantId) || item.variants[0];
          if (variant) {
            resolvedPrice = variant.price || item.price || 0;
            resolvedWeight = variant.weight ?? item.weight ?? 0;
            resolvedImage = variant.image || item.image || '';
            const attrStr = Object.values(variant.attributes || {})
              .filter(val => val && val !== 'Default')
              .map(val => val.includes('|') ? val.split('|')[0] : val)
              .join(' / ');
            resolvedTitle = attrStr ? `${item.title} (${attrStr})` : item.title;
          }
        }

        // Generate a unique key for selection tracking
        const uniqueKey = `${prodId}-${sv.variantId || 'default'}-${idx}`;

        return {
          uniqueKey,
          id: item._id || item.id,
          variantId: sv.variantId || 'default',
          title: isCurrent ? `${resolvedTitle} (This Item)` : resolvedTitle,
          price: resolvedPrice,
          image: resolvedImage,
          weight: resolvedWeight,
          category: typeof item.category === 'object' ? (item.category?.name || '') : (item.category || ''),
          isCurrent
        };
      }).filter(Boolean);

      const totalOriginalSum = items.reduce((acc, item) => acc + item.price, 0);
      const offerPrice = matchedCombo.offerPrice || 0;
      const discountPercent = totalOriginalSum > offerPrice
        ? Math.round(((totalOriginalSum - offerPrice) / totalOriginalSum) * 100)
        : 0;

      return {
        id: matchedCombo._id || matchedCombo.id,
        title: matchedCombo.name,
        offerPrice,
        rating: matchedCombo.rating || 5.0,
        reviewCount: matchedCombo.reviewCount || 0,
        discountPercent,
        category: matchedCombo.category || '',
        items
      };
    });
  }, [product, matchedCombos, selectedColor, selectedSize]);

  // Handle setting default active combo setup
  useEffect(() => {
    if (combosData.length > 0) {
      setActiveComboId(combosData[0].id);
    } else {
      setActiveComboId(null);
    }
  }, [product?.id, combosData.length]);

  const activeCombo = combosData.find(c => c.id === activeComboId) || combosData[0] || null;

  useEffect(() => {
    if (activeCombo && !selectionsByCombo[activeCombo.id]) {
      setSelectionsByCombo(prev => ({
        ...prev,
        [activeCombo.id]: activeCombo.items.map(item => item.uniqueKey)
      }));
    }
  }, [activeCombo, selectionsByCombo]);

  const selectedComboUniqueKeys = activeCombo ? (selectionsByCombo[activeCombo.id] || []) : [];

  const toggleComboItem = (uniqueKey, isCurrent) => {
    if (isCurrent || !activeCombo) return;
    setSelectionsByCombo(prev => {
      const current = prev[activeCombo.id] || [];
      const next = current.includes(uniqueKey)
        ? current.filter(i => i !== uniqueKey)
        : [...current, uniqueKey];
      return { ...prev, [activeCombo.id]: next };
    });
  };

  const isFullComboSelected = activeCombo ? selectedComboUniqueKeys.length === activeCombo.items.length : false;
  const regularComboSum = (activeCombo?.items || [])
    .filter(item => selectedComboUniqueKeys.includes(item.uniqueKey))
    .reduce((sum, item) => sum + item.price, 0);

  const finalComboPrice = isFullComboSelected
    ? (activeCombo?.offerPrice || Math.round(regularComboSum * (1 - (activeCombo?.discountPercent || 0) / 100)))
    : regularComboSum;

  const totalComboSavings = regularComboSum - finalComboPrice;

  const buildBundlePayload = () => {
    const selectedItems = activeCombo.items.filter(item => selectedComboUniqueKeys.includes(item.uniqueKey));
    return {
      id: isFullComboSelected ? activeCombo.id : `COMBO-CUSTOM-${Date.now()}`,
      productId: isFullComboSelected ? activeCombo.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFullComboSelected ? activeCombo.title : "Custom Pack Bundle Deal",
      price: finalComboPrice,
      quantity: 1,
      image: activeCombo.items[0].image,
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      weight: selectedItems.reduce((sum, item) => sum + (item.weight || 0), 0),
      category: activeCombo.category || selectedItems[0]?.category || 'Catalog',
      includedProducts: selectedItems.map(item => ({
        productId: item.id,
        id: item.id,
        variantId: item.variantId,
        title: item.title,
        image: item.image,
        price: item.price,
        weight: item.weight || 0,
        category: item.category || ''
      }))
    };
  };

  const handleAddBundleToCart = useThrottledCallback(() => {
    if (!activeCombo) return;
    const payload = buildBundlePayload();
    if (!isUserAuthenticated()) {
      toast.info('Please login to buy this combo bundle.');
      navigate('/login', { state: { from: location.pathname, addToCartPayload: payload } });
      return;
    }
    onAddToCart(payload);
    navigate('/cart');
  }, 1000);

  const handleAddBundleToBuy = useThrottledCallback(() => {
    if (!activeCombo) return;
    const payload = buildBundlePayload();
    if (!isUserAuthenticated()) {
      toast.info('Please login to checkout this combo bundle.');
      navigate('/login', { state: { from: '/checkout', directPurchaseBundlePayload: payload } });
      return;
    }
    navigate('/checkout', { state: { directPurchaseBundle: payload } });
  }, 1000);

  const handleSelectAlternativeCombo = (comboId) => {
    setActiveComboId(comboId);
    window.scrollTo({
      top: document.getElementById('main-combo-workspace').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  // Dynamic filter for alternative array split (safely placed above early condition escape check)
  const alternativeCombos = useMemo(() => {
    if (!activeComboId) return [];
    return combosData.filter(combo => combo.id !== activeComboId);
  }, [combosData, activeComboId]);

  // Safe runtime breakout check sequence
  if (combosData.length === 0 || !activeCombo) return null;

  return (
    <div id="main-combo-workspace" className="w-full mt-10">
      {/* Title Section Heading Layout */}
      <div className="mb-5">
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-emerald-100">
          <Sparkles size={11} /> Bundle & Save
        </span>
        <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
          Frequently Bought Together
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Get the most matching configuration straight out of the box, or click below to see alternative bundles.
        </p>
      </div>

      {/* Main Workspace Layout displaying Current Focus Package */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-sm font-black text-gray-900">{activeCombo.title}</h4>
          <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
            ★ {activeCombo.rating.toFixed(1)} ({activeCombo.reviewCount})
          </span>
          {activeCombo.id !== combosData[0]?.id && (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
              Alternative Pack Selection
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
          {/* Main Swiper Workspace Canvas Frame */}
          <div 
            key={activeCombo.id} 
            className="min-w-0 flex-1 relative bg-white border border-gray-150 rounded-xl p-5 shadow-2xs flex items-center"
          >
            {activeCombo.items.length > 0 && (
              <>
                <button className="combo-prev-btn absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>

                <div className="w-full overflow-hidden px-2">
                  <Swiper
                    modules={[Navigation]}
                    navigation={{ prevEl: '.combo-prev-btn', nextEl: '.combo-next-btn' }}
                    spaceBetween={16}
                    slidesPerView={1.2}
                    breakpoints={{
                      400: { slidesPerView: Math.min(1.5, activeCombo.items.length), spaceBetween: 12 },
                      550: { slidesPerView: Math.min(2, activeCombo.items.length), spaceBetween: 14 },
                      850: { slidesPerView: Math.min(3, activeCombo.items.length), spaceBetween: 16 },
                      1100: { slidesPerView: Math.min(4, activeCombo.items.length), spaceBetween: 16 }
                    }}
                    className="w-full"
                  >
                    {activeCombo.items.map((item, idx) => (
                      <SwiperSlide key={item.uniqueKey} className="py-1">
                        <div
                          onClick={() => toggleComboItem(item.uniqueKey, item.isCurrent)}
                          className={`w-full bg-white border rounded-xl p-4 flex flex-col items-center gap-3 transition-all relative ${
                            item.isCurrent ? 'cursor-default border-blue-400 ring-1 ring-blue-100' : 'cursor-pointer select-none'
                          } ${
                            selectedComboUniqueKeys.includes(item.uniqueKey)
                              ? 'border-blue-500 shadow-xs'
                              : 'opacity-40 border-gray-200 grayscale scale-95 hover:opacity-70'
                          }`}
                        >
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedComboUniqueKeys.includes(item.uniqueKey)}
                              onChange={() => {}}
                              disabled={item.isCurrent}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-gray-300 cursor-pointer"
                            />
                          </div>

                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100 flex items-center justify-center p-1">
                            <img
                              src={formatImageUrl(item.image)}
                              alt={item.title}
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                            />
                          </div>

                          <div className="text-center min-w-0 w-full">
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug h-8">
                              {item.title}
                            </h4>
                            <p className="text-sm font-black text-gray-900 mt-1">₹{item.price}</p>
                          </div>

                          {idx < activeCombo.items.length - 1 && (
                            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 bg-gray-100 p-1 rounded-full border-2 border-white shadow-xs pointer-events-none hidden lg:flex">
                              <Plus size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <button className="combo-next-btn absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Pricing Summary Calculation Card */}
          <div className="w-full md:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm shrink-0">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                Bundle Price Calculation
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Selected Items ({selectedComboUniqueKeys.length}):</span>
                  <span className="font-medium text-gray-900">₹{regularComboSum}</span>
                </div>
                {isFullComboSelected ? (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Combo Promotion Pack Discount:</span>
                    <span>-{activeCombo.discountPercent}%</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 text-[11px] text-amber-800 leading-normal">
                    💡 Select all components to qualify for the bundle discount structure.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm font-bold text-gray-800">Total Price:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-gray-900">₹{finalComboPrice}</span>
                  {totalComboSavings > 0 && (
                    <p className="text-[11px] font-bold text-green-600">Save ₹{totalComboSavings}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddBundleToCart}
                  className="w-full border border-gray-300 py-2 text-xs rounded-md font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Bundle to Cart
                </button>
                <button
                  onClick={handleAddBundleToBuy}
                  className="w-full bg-[#003147] text-white py-2 text-xs rounded-md font-bold hover:bg-[#002232] transition-colors cursor-pointer"
                >
                  Buy Bundle Set
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MORE BUNDLES TOGGLE TRIGGER PANEL CONTAINER */}
      {alternativeCombos.length > 0 && (
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={() => setShowAllCombos(!showAllCombos)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#003147] hover:border-gray-400 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            {showAllCombos ? (
              <>
                Hide Alternative Packages <ChevronUp size={14} />
              </>
            ) : (
              <>
                View More Combos ({alternativeCombos.length} alternative packs available) <ChevronDown size={14} />
              </>
            )}
          </button>

          {/* Smooth Accordion Tray containing alternative options */}
          <div
            ref={remainingCombosRef}
            style={{
              maxHeight: showAllCombos ? `${remainingCombosRef.current?.scrollHeight}px` : '0px',
              opacity: showAllCombos ? 1 : 0
            }}
            className="w-full overflow-hidden transition-all duration-300 ease-in-out"
          >
            <div className="pt-5 space-y-3">
              <div className="border-t border-dashed border-gray-200 my-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Other Pack Bundles for this Item:
              </p>
              
              {alternativeCombos.map((combo) => {
                return (
                  <div 
                    key={combo.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-gray-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Pack Meta Specifications */}
                    <div className="space-y-1 max-w-xs shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-100">
                          {combo.discountPercent}% OFF
                        </span>
                        <span className="text-xs font-bold text-amber-600">★ {combo.rating.toFixed(1)}</span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 truncate">{combo.title}</h4>
                      <p className="text-xs text-gray-400">{combo.items.length} items included</p>
                      <div className="pt-1">
                        <span className="text-base font-black text-gray-900">₹{combo.offerPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Miniature Horizontal Item Preview Row */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none flex-1 min-w-0">
                      {combo.items.map((item, idx) => (
                        <React.Fragment key={item.uniqueKey}>
                          <div className={`flex items-center gap-2 bg-gray-50 border rounded-lg p-2 shrink-0 max-w-[160px] ${item.isCurrent ? 'border-blue-200 bg-blue-50/20' : 'border-gray-150'}`}>
                            <div className="w-10 h-10 bg-white border border-gray-100 rounded flex-shrink-0 p-0.5 flex items-center justify-center">
                              <img 
                                src={formatImageUrl(item.image)} 
                                alt="" 
                                className="w-full h-full object-contain mix-blend-multiply" 
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-gray-700 truncate leading-tight">
                                {item.isCurrent ? 'Main Product' : item.title}
                              </p>
                              <p className="text-[11px] font-black text-gray-900 mt-0.5">₹{item.price}</p>
                            </div>
                          </div>
                          {idx < combo.items.length - 1 && (
                            <Plus size={11} className="text-gray-300 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Action Selector Trigger */}
                    <div className="shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleSelectAlternativeCombo(combo.id)}
                        className="bg-[#003147] hover:bg-[#002232] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Customize This Pack
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboSection;