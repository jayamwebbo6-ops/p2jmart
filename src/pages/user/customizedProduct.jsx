import React from 'react';
import SubCategoryPage from './Subcategory';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

const CustomizedProduct = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <SubCategoryPage 
      wishlist={wishlist}
      addToWishlist={addToWishlist}
      removeFromWishlist={removeFromWishlist}
      onAddToCart={addToCart}
      isCustomizedPage={true}
    />
  );
};

export default CustomizedProduct;