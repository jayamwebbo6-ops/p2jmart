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

  // Helper to check stock of all constituent items in a combo
  const isComboInStock = (c) => {
    if (!c.selectedItemIds || c.selectedItemIds.length === 0) return false;
    return c.selectedItemIds.every(item => {
      if (!item) return false;
      if (item.status === false || item.isActive === false) return false;

      const itemIdStr = item._id || item.id;
      const sv = c.selectedVariants?.find(v => {
        const vProdId = v.productId?._id || v.productId?.id || v.productId || v;
        return vProdId === itemIdStr;
      });

      if (sv && sv.variantId && sv.variantId !== 'default' && item.variants && item.variants.length > 0) {
        const variant = item.variants.find(v => v.id === sv.variantId || v._id === sv.variantId);
        if (variant) {
          return (Number(variant.stock) || 0) > 0;
        }
        return false;
      } else if (item.variants && item.variants.length > 0) {
        return item.variants.some(v => (Number(v.stock) || 0) > 0);
      } else {
        return (Number(item.stock) || 0) > 0;
      }
    });
  };

  // 1. Find EVERY active combo containing this product that has all items in stock
  const matchedCombos = useMemo(() => {
    if (!product || !combos || combos.length === 0) return [];
    const currentProdId = product.id;
    return combos.filter(c =>
      c.status !== false &&
      c.selectedItemIds?.some(item => (item._id || item.id || item) === currentProdId) &&
      isComboInStock(c)
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

        const currentActiveVariantId = product?.activeVariant?.id || product?.activeVariant?._id;
        const svVariantId = sv.variantId && sv.variantId !== 'default' ? sv.variantId : null;

     const itemId = String(item._id || item.id);
const currentProductId = String(product._id || product.id);

const isCurrent =
  itemId === currentProductId &&
  (!svVariantId ||
    !currentActiveVariantId ||
    String(svVariantId) === String(currentActiveVariantId));

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

      const sumOfSellingPrices = items.reduce((sum, item) => sum + item.price, 0);
      const totalOriginalPrice = sumOfSellingPrices;
      const offerPrice = Number(matchedCombo.offerPrice || 0);

      const comboDiscountAmount =
        totalOriginalPrice > offerPrice ? totalOriginalPrice - offerPrice : 0;

      const discountPercent =
        totalOriginalPrice > 0 && comboDiscountAmount > 0
          ? ((comboDiscountAmount / totalOriginalPrice) * 100)
          : 0;

      return {
        id: matchedCombo._id || matchedCombo.id,
        title: matchedCombo.name,
        offerPrice,
        totalOriginalPrice,
        comboDiscountAmount,
        rating: matchedCombo.rating || 5.0,
        reviewCount: matchedCombo.reviewCount || 0,
        discountPercent,
        category: matchedCombo.category || '',
        items
      };
    });
  }, [product, matchedCombos, selectedColor, selectedSize]);

  const prevProductIdRef = useRef(null);

  // Handle setting default active combo setup
  useEffect(() => {
    if (!combosData.length) return;

    const currentProdId = product?._id || product?.id;
    const isNewProduct = prevProductIdRef.current !== currentProdId;
    prevProductIdRef.current = currentProdId;

    setSelectionsByCombo(prev => {
      const updated = isNewProduct ? {} : { ...prev };

      combosData.forEach(combo => {
        if (isNewProduct || !updated[combo.id]) {
          // Select all items in the combo by default
          updated[combo.id] = combo.items.map(item => item.uniqueKey);
        }
      });

      return updated;
    });
  }, [combosData, product]);

  // FIX: `activeCombo` falls back to the first combo whenever no explicit
  // choice has been made yet, so "the active pack" always resolves to something
  // real from the very first render (this also drives the alternativeCombos fix below).
  const activeCombo = combosData.find(c => c.id === activeComboId) || combosData[0] || null;

  // FIX: there used to be a SECOND effect here that also initialized default
  // selections, racing with the effect above and non-deterministically
  // overwriting it (sometimes "all items selected", sometimes "only the
  // current item selected", depending on effect timing). There is now exactly
  // one place that seeds default selections, so the starting state is
  // predictable and toggling items up to a full set reliably flips
  // `isFullComboSelected` below.
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

  const toggleBundleComboItem = (comboId, uniqueKey) => {
    setSelectionsByCombo(prev => {
      const current = prev[comboId] || [];

      const next = current.includes(uniqueKey)
        ? current.filter(id => id !== uniqueKey)
        : [...current, uniqueKey];

      return {
        ...prev,
        [comboId]: next
      };
    });
  };

  


  const isFullComboSelected = activeCombo ? selectedComboUniqueKeys.length === activeCombo.items.length : false;
  const regularComboSum = (activeCombo?.items || [])
    .filter(item => selectedComboUniqueKeys.includes(item.uniqueKey))
    .reduce((sum, item) => sum + item.price, 0);

  const finalComboPrice = isFullComboSelected
    ? Number(activeCombo?.offerPrice || 0)
    : regularComboSum;

  const totalComboSavings = isFullComboSelected
    ? Number(activeCombo?.comboDiscountAmount || 0)
    : 0;

  // FIX: now takes the combo + its selected keys as arguments instead of
  // silently reading `activeCombo` / `selectedComboUniqueKeys` from closure.
  // This is what makes "Bundle to Cart" work correctly for alternative packs.
  const buildBundlePayload = (combo, selectedKeys) => {
    const selectedItems = combo.items.filter(item => selectedKeys.includes(item.uniqueKey));
    const isFull = selectedKeys.length === combo.items.length;
    const price = isFull ? Number(combo.offerPrice || 0) : selectedItems.reduce((sum, item) => sum + item.price, 0);

    return {
      id: isFull ? combo.id : `COMBO-CUSTOM-${Date.now()}`,
      productId: isFull ? combo.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFull ? combo.title : "Custom Pack Bundle Deal",
      price,
      quantity: 1,
      image: selectedItems[0]?.image || combo.items[0]?.image,
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      weight: selectedItems.reduce((sum, item) => sum + (item.weight || 0), 0),
      freeShipping: 'No',
      category: combo.category || selectedItems[0]?.category || 'Catalog',
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

  // FIX: generic, parameterized handlers — usable both for the main workspace
  // combo AND for any alternative combo card, each with its own selections.
  const handleAddBundleToCart = useThrottledCallback((combo, selectedKeys) => {
    if (!combo || !selectedKeys?.length) return;
    const payload = buildBundlePayload(combo, selectedKeys);
    if (!isUserAuthenticated()) {
      toast.info('Please login to buy this combo bundle.');
      navigate('/login', { state: { from: location.pathname, addToCartPayload: payload } });
      return;
    }
    onAddToCart(payload);
    navigate('/cart');
  }, 1000);

  const handleAddBundleToBuy = useThrottledCallback((combo, selectedKeys) => {
    if (!combo || !selectedKeys?.length) return;
    const payload = buildBundlePayload(combo, selectedKeys);
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
  // FIX: this previously keyed off `activeComboId`, which starts (and stays)
  // `null` until the user clicks something *inside* this very panel — a
  // deadlock that meant "View More Combos" never appeared, and other packs
  // containing the same product were never surfaced. Keying off `activeCombo`
  // (which always resolves to a real combo via its fallback above) fixes both.
  const alternativeCombos = useMemo(() => {
    if (!activeCombo) return [];
    return combosData.filter(combo => combo.id !== activeCombo.id);
  }, [combosData, activeCombo]);

  // Safe runtime breakout check sequence
  if (combosData.length === 0 || !activeCombo) return null;


  return (
    <div id="main-combo-workspace" className="w-full px-4 mt-10">
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

        <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
          {/* Main Swiper Workspace Canvas Frame */}
          <div
            key={activeCombo.id}
            className="w-full min-w-0 flex-1 relative bg-white border border-gray-150 rounded-xl p-3 sm:p-5 shadow-2xs flex items-center"
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
                    slidesPerView={1}
                    breakpoints={{
                      320: { slidesPerView: Math.min(1.2, activeCombo.items.length), spaceBetween: 12 },
                      480: { slidesPerView: Math.min(1.5, activeCombo.items.length), spaceBetween: 12 },
                      640: { slidesPerView: Math.min(2, activeCombo.items.length), spaceBetween: 16 },
                      1024: { slidesPerView: Math.min(3, activeCombo.items.length), spaceBetween: 16 }
                    }}
                    className="w-full"
                  >
                    {activeCombo.items.map((item, idx) => (
                      <SwiperSlide key={item.uniqueKey} className="py-2">
                        <div
                          onClick={() => toggleComboItem(item.uniqueKey, item.isCurrent)}
                          className={`w-full bg-white border rounded-xl p-3 sm:p-5 flex flex-col items-center gap-3 transition-all relative ${
                            item.isCurrent ? 'cursor-default border-blue-400 ring-1 ring-blue-100' : 'cursor-pointer select-none'
                          } ${
                            selectedComboUniqueKeys.includes(item.uniqueKey)
                              ? 'border-blue-500 shadow-md'
                              : 'opacity-40 border-gray-200 grayscale scale-95 hover:opacity-70'
                          }`}
                        >
                          <div className="absolute top-3 left-3 z-10">
                            <input
                              type="checkbox"
                              checked={selectedComboUniqueKeys.includes(item.uniqueKey)}
                              onChange={() => {}}
                              disabled={item.isCurrent}
                              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-400 border-gray-300 cursor-pointer"
                            />
                          </div>

                          {/* ENLARGED IMAGE CONTAINER - MEDIUM TO LARGE SIZE */}
                          <div className="w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 flex items-center justify-center p-3 shadow-md hover:shadow-lg transition-shadow">
                            <img
                              src={formatImageUrl(item.image)}
                              alt={item.title}
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
                            />
                          </div>

                          {/* ITEM DETAILS - CLEAR AND PROMINENT */}
                          <div className="text-center min-w-0 w-full px-2">
                            <h4 className="text-sm text-gray-800 line-clamp-2 leading-snug h-10">
                              {item.title}
                            </h4>
                            <p className="text-[#003147] font-bold text-sm sm:text-[16px] whitespace-nowrap">₹{item.price}</p>
                          </div>

                          {idx < activeCombo.items.length - 1 && (
                            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 bg-gray-100 p-1 rounded-full border-2 border-white shadow-xs pointer-events-none hidden md:flex">
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
          <div className="w-full xl:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm shrink-0">
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
                  <>
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Combo Promotion Pack Discount:</span>
                      <span>{activeCombo.discountPercent.toFixed(0)}%</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Combo Savings:</span>
                      <span className="font-bold text-green-700">
                        ₹{activeCombo.comboDiscountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex flex-col gap-2 items-center text-center shadow-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                      <Sparkles size={14} className="text-amber-600 animate-pulse" />
                      <span>Unlock Special Bundle Price!</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      You are buying a partial set. Select all items to activate the <strong>{activeCombo.discountPercent.toFixed(0)}% discount</strong> and save <strong>₹{activeCombo.comboDiscountAmount.toLocaleString('en-IN')}</strong>!
                    </p>
                    <button
                      onClick={() => {
                        setSelectionsByCombo(prev => ({
                          ...prev,
                          [activeCombo.id]: activeCombo.items.map(i => i.uniqueKey)
                        }));
                      }}
                      className="mt-1 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      Buy All Combo Products (Save ₹{activeCombo.comboDiscountAmount.toLocaleString('en-IN')})
                    </button>
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
                  onClick={() => handleAddBundleToCart(activeCombo, selectedComboUniqueKeys)}
                  disabled={!isFullComboSelected}
                  className="w-full border border-gray-300 py-2 text-xs rounded-md font-bold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bundle to Cart
                </button>
                <button
                  onClick={() => handleAddBundleToBuy(activeCombo, selectedComboUniqueKeys)}
                  disabled={!isFullComboSelected}
                  className="w-full bg-[#003147] text-white py-2 text-xs rounded-md font-bold hover:bg-[#002232] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 flex flex-col items-center w-full">
          <button
            onClick={() => setShowAllCombos(!showAllCombos)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-800 hover:text-[#003147] hover:border-[#003147] hover:bg-blue-50 font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {showAllCombos ? (
              <>
                Hide<ChevronUp size={12} />
              </>
            ) : (
              <>
                View More Combos ({alternativeCombos.length}) <ChevronDown size={12} />
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
            <div className="pt-6 space-y-5 px-2">
              <div className="border-t border-dashed border-gray-300 my-2" />

              {alternativeCombos.map((combo) => {
                // FIX: combosData objects don't have `finalComboPrice`, `regularPrice`,
                // or `discountAmount` properties — those fallbacks were dead code.
                // Reading directly from the combo's real fields instead.
                const offerPrice = combo.offerPrice || 0;
                const discountAmount = combo.comboDiscountAmount || 0;
                const discountPercent = combo.discountPercent || 0;
                const rating = combo.rating || 0;
                const reviewCount = combo.reviewCount || 0;

                const allSelectedKeys = selectionsByCombo[combo.id] || [];

                const isFullComboSelected =
                  allSelectedKeys.length === combo.items.length;

                // Calculate total for selected items (including main product)
                let selectedItemsSum = 0;
                if (combo.items && allSelectedKeys.length > 0) {
                  selectedItemsSum = combo.items
                    .filter(item => allSelectedKeys.includes(item.uniqueKey))
                    .reduce((sum, item) => sum + (item.price || 0), 0);
                }

                // Calculate final price
                const finalBundlePrice = isFullComboSelected && discountPercent > 0
                  ? offerPrice
                  : selectedItemsSum;

                return (
                  <div key={combo.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                    {/* Bundle Header */}
                    <div className="flex items-center gap-2 mb-6">
                      <h4 className="text-base font-black text-gray-900">{combo.title || 'Combo Bundle'}</h4>
                      <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                        ★ {rating.toFixed(1)} ({reviewCount})
                      </span>
                      {combo.id !== combosData[0]?.id && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                          Alternative Pack Selection
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
                      {/* Items Carousel Display */}
                      <div
                        className="w-full min-w-0 flex-1 relative bg-white border border-gray-150 rounded-xl p-3 sm:p-5 shadow-2xs flex items-center"
                      >
                        {combo.items && combo.items.length > 0 && (
                          <>
                            <button className={`bundle-prev-btn-${combo.id} absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}>
                              <ChevronLeft size={20} className="text-gray-700" />
                            </button>

                            <div className="w-full overflow-hidden px-2">
                              <Swiper
                                modules={[Navigation]}
                                navigation={{ prevEl: `.bundle-prev-btn-${combo.id}`, nextEl: `.bundle-next-btn-${combo.id}` }}
                                spaceBetween={16}
                                slidesPerView={1}
                                breakpoints={{
                                  320: { slidesPerView: Math.min(1.2, combo.items.length), spaceBetween: 12 },
                                  480: { slidesPerView: Math.min(1.5, combo.items.length), spaceBetween: 12 },
                                  640: { slidesPerView: Math.min(2, combo.items.length), spaceBetween: 16 },
                                  1024: { slidesPerView: Math.min(3, combo.items.length), spaceBetween: 16 }
                                }}
                                className="w-full"
                              >
                                {combo.items.map((item, idx) => {
                                  const isItemSelected = allSelectedKeys.includes(item.uniqueKey);

                                  return (
                                    <SwiperSlide key={item.uniqueKey || idx} className="py-2">
                                      <div
                                        onClick={() => !item.isCurrent && toggleBundleComboItem(combo.id, item.uniqueKey)}
                                        className={`w-full bg-white border rounded-xl p-3 sm:p-5 flex flex-col items-center gap-3 transition-all relative ${
                                          item.isCurrent
                                            ? 'cursor-default border-blue-400 ring-2 ring-blue-200 shadow-lg'
                                            : 'cursor-pointer'
                                        } ${
                                          isItemSelected
                                            ? 'border-blue-500 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                      >

                                        {/* CHECKBOX - Main product always checked and disabled */}
                                        <div className="absolute top-3 left-3 z-10">
                                          <input
                                            type="checkbox"
                                            checked={isItemSelected}
                                            onChange={() => {}}
                                            disabled={item.isCurrent}
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-400 border-gray-300 cursor-pointer"
                                          />
                                        </div>

                                        {/* ENLARGED IMAGE CONTAINER */}
                                        <div className="w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 flex items-center justify-center p-3 shadow-md hover:shadow-lg transition-shadow">
                                          <img
                                            src={formatImageUrl(item.image)}
                                            alt={item.title || 'Product'}
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
                                          />
                                        </div>

                                        {/* ITEM DETAILS - CLEAR AND PROMINENT */}
                                        <div className="text-center min-w-0 w-full px-2">
                                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug h-10">
                                            {item.title || 'Product'}
                                          </h4>
                                          <p className="text-lg font-black text-gray-900 mt-2">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                                        </div>

                                        {/* Current Item Badge */}
                                        {item.isCurrent && (
                                          <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">
                                            current item
                                          </span>
                                        )}

                                         {/* Plus separator */}
                                         {idx < combo.items.length - 1 && (
                                           <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-gray-400 bg-gray-100 p-1 rounded-full border-2 border-white shadow-xs pointer-events-none hidden md:flex">
                                             <Plus size={10} strokeWidth={3} />
                                           </div>
                                         )}
                                      </div>
                                    </SwiperSlide>
                                  );
                                })}
                              </Swiper>
                            </div>

                            <button className={`bundle-next-btn-${combo.id} absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}>
                              <ChevronRight size={20} className="text-gray-700" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Pricing Summary Card */}
                      <div  className="w-full xl:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm shrink-0">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Bundle Price Calculation
                          </h4>
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Selected Items ({allSelectedKeys.length}):</span>
                              <span className="font-medium text-gray-900">₹{selectedItemsSum.toLocaleString('en-IN')}</span>
                            </div>

                            {isFullComboSelected && discountPercent > 0 ? (
                              <>
                                <div className="flex justify-between text-green-600 font-medium">
                                  <span>Combo Discount:</span>
                                  <span>{discountPercent.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Combo Savings:</span>
                                  <span className="font-bold text-green-700">₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                              </>
                            ) : (
                              <div className="mt-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex flex-col gap-2 items-center text-center shadow-xs">
                                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                                  <Sparkles size={14} className="text-amber-600 animate-pulse" />
                                  <span>Unlock Special Bundle Price!</span>
                                </div>
                                <p className="text-[11px] text-amber-700 leading-normal">
                                  You are buying a partial set. Select all items to activate the <strong>{discountPercent.toFixed(0)}% discount</strong> and save <strong>₹{discountAmount.toLocaleString('en-IN')}</strong>!
                                </p>
                                <button
                                  onClick={() => {
                                    setSelectionsByCombo(prev => ({
                                      ...prev,
                                      [combo.id]: combo.items.map(i => i.uniqueKey)
                                    }));
                                  }}
                                  className="mt-1 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                  Buy All Combo Products (Save ₹{discountAmount.toLocaleString('en-IN')})
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-baseline mb-4">
                            <span className="text-sm font-bold text-gray-800">Total Price:</span>
                            <div className="text-right">
                              <span className="text-xl font-black text-gray-900">
                                ₹{finalBundlePrice.toLocaleString('en-IN')}
                              </span>
                              {isFullComboSelected && discountAmount > 0 && (
                                <p className="text-[11px] font-bold text-green-600">Save ₹{discountAmount.toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAddBundleToCart(combo, allSelectedKeys)}
                              className="w-full border border-gray-300 py-2 text-xs rounded-md font-bold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isFullComboSelected}
                            >
                              Bundle to Cart
                            </button>
                            <button
                              onClick={() => {
                                handleSelectAlternativeCombo(combo.id);
                                handleAddBundleToBuy(combo, allSelectedKeys);
                              }}
                              className="w-full bg-[#003147] text-white py-2 text-xs rounded-md font-bold hover:bg-[#002232] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isFullComboSelected}
                            >
                              Customize Pack
                            </button>
                          </div>
                        </div>
                      </div>

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