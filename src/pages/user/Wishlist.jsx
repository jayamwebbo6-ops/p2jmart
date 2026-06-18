import React from "react";
import { XCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

// Accept the shared state and handlers directly from App.jsx props
const Wishlist = ({ wishlist = [], removeFromWishlist }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          My Wishlist
        </h1>

        <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl py-16 px-4 text-center max-w-md mx-auto mt-8">
          {/* Centered Clean XCircle representation */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <XCircle size={32} strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Your Wishlist is Empty
          </h2>

          <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
            You don't have any products saved right now. Explore our store to find your favorite products.
          </p>

          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 mt-6 bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-sm"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* 
          Grid Responsiveness breakdown:
          - Default (below 825px): grid-cols-2 (2 columns)
          - From 825px to 1020px: min-[825px]:grid-cols-3 (3 columns)
          - Above 1020px: min-[1020px]:grid-cols-4 (4 columns)
        */
        <div className="grid grid-cols-2 min-[955px]:grid-cols-3 min-[1020px]:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="wishlist"
              isWishlisted={true}
              onRemoveWishlist={removeFromWishlist} // Calls the global state updater
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

