import React, { useState } from "react";
import { XCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import ConfirmationModal from "../../components/ConfirmationModal"; // Adjust path as per your directory structure

// Accept the shared state and handlers directly from App.jsx props
const Wishlist = ({ wishlist = [], removeFromWishlist }) => {
  // State to handle modal open/close state and track which item to delete
  const [productToDelete, setProductToDelete] = useState(null);

  const handleOpenConfirmation = (productId) => {
    // Find the complete product item to show its title inside the modal description message if needed
    const targetProduct = wishlist.find((item) => item.id === productId);
    setProductToDelete(targetProduct);
  };

  const handleConfirmRemove = () => {
    if (productToDelete) {
      removeFromWishlist(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto  py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          My Wishlist
        </h1>

        <span className="text-[10px] xs:text-sm font-medium bg-gray-100 text-gray-600 px-2 xs:px-3 py-0.5 xs:py-1 rounded-full whitespace-nowrap">
          {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlist.length === 0 ? (
        /* Empty State adjustments for ultra-narrow widths */
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl py-10 xs:py-16 px-3 xs:px-4 text-center max-w-md mx-auto mt-4 xs:mt-8">
          {/* Centered Clean XCircle representation */}
          <div className="w-12 h-12 xs:w-16 xs:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 text-red-500">
            <XCircle size={24} className="xs:w-[32px] xs:h-[32px]" strokeWidth={1.5} />
          </div>

          <h2 className="text-base xs:text-xl font-semibold text-gray-800 leading-tight">
            Your Wishlist is Empty
          </h2>

          <p className="text-gray-500 mt-1.5 xs:mt-2 text-xs xs:text-sm max-w-xs mx-auto px-1">
            You don't have any products saved right now. Explore our store to find your favorite products.
          </p>

          <Link 
            to="/products" 
            className="inline-flex items-center gap-1.5 mt-5 xs:mt-6 bg-primary text-white text-xs xs:text-sm font-medium px-4 xs:px-6 py-2 xs:py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-sm max-w-full justify-center"
          >
            <ShoppingBag size={14} className="xs:w-[16px] xs:h-[16px]" />
            <span className="truncate">Continue Shopping</span>
          </Link>
        </div>
      ) : (
        /* 
          Grid Responsiveness breakdown:
          - Default (below 350px): grid-cols-1 (1 column to prevent side-by-side breakage)
          - From 350px to 825px: min-[350px]:grid-cols-2 (2 columns)
          - From 825px to 1020px: min-[825px]:grid-cols-3 (3 columns)
          - Above 1020px: min-[1020px]:grid-cols-4 (4 columns)
        */
        <div className="grid grid-cols-1 min-[350px]:grid-cols-2 min-[825px]:grid-cols-3 min-[1020px]:grid-cols-4 gap-3 xs:gap-4">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="wishlist"
              isWishlisted={true}
              onRemoveWishlist={handleOpenConfirmation} // Catch action to open modal overlay first
            />
          ))}
        </div>
      )}

      {/* Reusable Confirmation Overlay Portal Trigger */}
      <ConfirmationModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Item"
        message={`Are you sure you want to remove "${productToDelete?.title || 'this item'}" from your wishlist?`}
        confirmText="Remove"
        cancelText="Keep"
        isDanger={true}
      />
    </div>
  );
};

export default Wishlist;