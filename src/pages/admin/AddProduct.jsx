import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  Percent,
  Star,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { toast } from '../../components/toast';

const AddProduct = () => {
  const navigate = useNavigate();
  
  // Read query params manually
  const queryParams = new URLSearchParams(window.location.search);
  const isEdit = queryParams.get('edit') === 'true';
  const catId = queryParams.get('catId') || '';
  const subId = queryParams.get('subId') || '';
  const prodId = queryParams.get('prodId') || '';

  // Load catalog
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_catalog');
    return saved ? JSON.parse(saved) : [];
  });

  // Selected category and subcategory
  const [selectedCatId, setSelectedCatId] = useState(catId);
  const [selectedSubId, setSelectedSubId] = useState(subId);

  // Form states
  const [prodForm, setProdForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '0',
    image: '',
    rating: '5',
    reviews: '0'
  });

  // Find parent category for selected subcategory
  useEffect(() => {
    if (catalog.length > 0 && selectedSubId) {
      const parentCat = catalog.find(cat => 
        cat.subcategories.some(sub => sub.id === selectedSubId)
      );
      if (parentCat) {
        setSelectedCatId(parentCat.id);
      }
    }
  }, [catalog, selectedSubId]);

  // Load product if editing
  useEffect(() => {
    if (isEdit && prodId && catalog.length > 0) {
      // Find the subcategory
      let foundProd = null;
      for (const cat of catalog) {
        const sub = cat.subcategories.find(s => s.id === selectedSubId);
        if (sub) {
          const prod = sub.products.find(p => p.id === prodId);
          if (prod) {
            foundProd = prod;
            break;
          }
        }
      }

      if (foundProd) {
        setProdForm({
          title: foundProd.title || '',
          price: foundProd.price !== undefined ? foundProd.price.toString() : '',
          originalPrice: foundProd.originalPrice !== undefined ? foundProd.originalPrice.toString() : '',
          discount: foundProd.discount !== undefined ? foundProd.discount.toString() : '0',
          image: foundProd.image || '',
          rating: foundProd.rating !== undefined ? foundProd.rating.toString() : '5',
          reviews: foundProd.reviews !== undefined ? foundProd.reviews.toString() : '0'
        });
      } else {
        toast.error('Product not found for editing');
      }
    }
  }, [isEdit, prodId, catalog, selectedSubId]);

  // Get active subcategories list
  const activeCategory = catalog.find(c => c.id === selectedCatId);
  const subcategoriesList = activeCategory ? activeCategory.subcategories : [];

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!selectedSubId) return toast.error('Please select a Subcategory');
    if (!prodForm.title.trim()) return toast.error('Product Title is required');
    if (!prodForm.price.trim()) return toast.error('Price is required');

    const priceNum = parseFloat(prodForm.price);
    const originalPriceNum = prodForm.originalPrice.trim() ? parseFloat(prodForm.originalPrice) : null;
    const discountNum = prodForm.discount.trim() ? parseInt(prodForm.discount) : 0;
    const ratingNum = prodForm.rating.trim() ? parseFloat(prodForm.rating) : 5;
    const reviewsNum = prodForm.reviews.trim() ? parseInt(prodForm.reviews) : 0;

    const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
    const finalImageUrl = prodForm.image.trim() || defaultImage;

    let updatedCatalog = [];

    if (isEdit && prodId) {
      // Edit Mode
      updatedCatalog = catalog.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id === selectedSubId) {
            return {
              ...sub,
              products: sub.products.map(p => 
                p.id === prodId 
                  ? { 
                      ...p, 
                      title: prodForm.title, 
                      price: priceNum, 
                      originalPrice: originalPriceNum, 
                      discount: discountNum, 
                      image: finalImageUrl, 
                      rating: ratingNum, 
                      reviews: reviewsNum 
                    } 
                  : p
              )
            };
          }
          return sub;
        })
      }));
      toast.success('Product updated successfully');
    } else {
      // Add Mode
      const newProd = {
        id: `prod-${Date.now()}`,
        title: prodForm.title,
        price: priceNum,
        originalPrice: originalPriceNum,
        discount: discountNum,
        image: finalImageUrl,
        rating: ratingNum,
        reviews: reviewsNum
      };

      updatedCatalog = catalog.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id === selectedSubId) {
            return {
              ...sub,
              products: [...sub.products, newProd]
            };
          }
          return sub;
        })
      }));
      toast.success('Product added successfully');
    }

    localStorage.setItem('p2j_mart_catalog', JSON.stringify(updatedCatalog));
    navigate('/admin/products');
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-200 rounded-lg text-[#001E3C] transition-colors border border-gray-200 bg-white shadow-sm"
          title="Back to Products"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#001E3C] tracking-tight">
            {isEdit ? 'Edit Product Details' : 'Add New Product'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEdit ? 'Modify pricing, images, and reviews for this product.' : 'Configure pricing, ratings, and media for a new storefront product.'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-4xl">
        <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-6">
          
          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Form inputs */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-150 pb-2">
                Product Details
              </h3>

              {/* Title input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Package size={12} /> Product Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Custom Spotify Frame Plaque"
                  value={prodForm.title}
                  onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                  required
                />
              </div>

              {/* Category / Subcategory dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={12} /> Category
                  </label>
                  <select 
                    value={selectedCatId}
                    onChange={(e) => {
                      setSelectedCatId(e.target.value);
                      setSelectedSubId('');
                    }}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium cursor-pointer"
                    disabled={isEdit}
                    required
                  >
                    <option value="">Select Category</option>
                    {catalog.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={12} /> Subcategory
                  </label>
                  <select 
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium cursor-pointer"
                    disabled={isEdit || !selectedCatId}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesList.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing section */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} /> Price (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="500"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} /> Original Price (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="550 (optional)"
                    value={prodForm.originalPrice}
                    onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Percent size={12} /> Discount (%)
                  </label>
                  <input 
                    type="number" 
                    placeholder="10"
                    value={prodForm.discount}
                    onChange={(e) => setProdForm({ ...prodForm, discount: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Media, ratings, live preview */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-150 pb-2">
                Media & Ratings
              </h3>

              {/* Image Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon size={12} /> Upload Product Image
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProdForm({ ...prodForm, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium cursor-pointer"
                />
              </div>

              {/* Rating & reviews */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Star size={12} /> Rating (1-5)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="4.8"
                    value={prodForm.rating}
                    onChange={(e) => setProdForm({ ...prodForm, rating: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Reviews Count
                  </label>
                  <input 
                    type="number" 
                    placeholder="24"
                    value={prodForm.reviews}
                    onChange={(e) => setProdForm({ ...prodForm, reviews: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="mt-2 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Storefront Card Preview</span>
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex gap-3 h-28 items-center max-w-sm shadow-inner">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white aspect-square">
                    <img 
                      src={prodForm.image.trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight tracking-wide">
                      {prodForm.title.trim() || 'Product Preview Title'}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-bold text-gray-950">₹{prodForm.price || '0'}</span>
                      {prodForm.originalPrice && (
                        <span className="text-[9px] text-gray-400 line-through">₹{prodForm.originalPrice}</span>
                      )}
                      {parseInt(prodForm.discount) > 0 && (
                        <span className="text-[9px] text-emerald-600 font-bold">{prodForm.discount}% Off</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={9} fill="currentColor" className="text-amber-400" />
                      <span className="text-[9px] font-bold text-gray-600">{parseFloat(prodForm.rating || 5).toFixed(1)}</span>
                      <span className="text-[9px] text-gray-400">({prodForm.reviews || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
            <button 
              type="button" 
              onClick={() => navigate('/admin/products')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-[#001E3C] hover:bg-[#003147] text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              Save Product
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
