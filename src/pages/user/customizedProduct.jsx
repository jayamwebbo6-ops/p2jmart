import React, { useState } from 'react';
import SubCategoryPage from '../../pages/user/Subcategory'; // Fix this import path to point to your page file
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate hook

const CustomizedProduct = () => {
  // Optional: You can manage a local state for customized products, wishlist state, etc.
  const navigate = useNavigate(); // 2. Initialize the routing instance
  const [customWishlist, setCustomWishlist] = useState([]);

  const handleAddToWishlist = (product) => {
    setCustomWishlist((prev) => [...prev, product]);
  };

  const handleRemoveFromWishlist = (product) => {
    setCustomWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleProductSelectionRedirect = (product) => {
    navigate(`/customizedProductDetail/${product.id}`, { state: { product } });
  };
  
  return (
    <div className="pt-10">
      <SubCategoryPage 
        wishlist={customWishlist}
        addToWishlist={handleAddToWishlist}
        removeFromWishlist={handleRemoveFromWishlist}
        onProductClick={handleProductSelectionRedirect} // <-- FIXED: Added this missing prop line!
        // If you ever want to pass custom products here instead of dummy data:
        // products={YOUR_CUSTOM_STATE_OR_API_DATA} 
      />
    </div>
  );
};

export default CustomizedProduct;