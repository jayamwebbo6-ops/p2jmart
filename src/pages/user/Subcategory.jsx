import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  Grid,
  List,
  ChevronRight,
} from "lucide-react";

/* ---------------------------
   Dummy Products
---------------------------- */

const productsData = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    size: "L",
    price: 79999,
    originalPrice: 99999,
    discount: 20,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
  },
  {
    id: 2,
    name: "boAt Rockerz Headphone",
    brand: "Boat",
    size: "M",
    price: 1999,
    originalPrice: 3999,
    discount: 50,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  },
  {
    id: 3,
    name: "Curved Monitor 4K",
    brand: "LG",
    size: "XL",
    price: 25999,
    originalPrice: 32999,
    discount: 25,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600",
  },
  {
    id: 4,
    name: "Apple Watch Series",
    brand: "Apple",
    size: "S",
    price: 34999,
    originalPrice: 42999,
    discount: 18,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
  },
  {
    id: 5,
    name: "Premium Gift Box",
    brand: "GiftPro",
    size: "M",
    price: 899,
    originalPrice: 1499,
    discount: 40,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600",
  },
  {
    id: 6,
    name: "Luxury Photo Frame",
    brand: "FrameArt",
    size: "L",
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600",
  },
  {
    id: 7,
    name: "Wireless Earbuds",
    brand: "Boat",
    size: "S",
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
  },
  {
    id: 8,
    name: "Gaming Keyboard",
    brand: "Logitech",
    size: "XL",
    price: 3999,
    originalPrice: 5999,
    discount: 30,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600",
  },
];

/* ---------------------------
   Skeleton Loader
---------------------------- */

const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200"></div>

      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>

        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

/* ---------------------------
   Product Card
---------------------------- */

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">

      <div className="relative h-56 bg-white">

        <button className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-[#002060] hover:text-white transition">
          <Heart size={18} />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">

        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[42px]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={14}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}

          <span className="text-xs text-gray-500 ml-1">
            ({product.rating})
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-[#002060]">
            ₹{product.price}
          </span>

          <span className="text-sm text-gray-400 line-through">
            ₹{product.originalPrice}
          </span>
        </div>

        <div className="text-green-600 text-sm font-medium mt-1">
          {product.discount}% Off
        </div>

        <div className="mt-auto pt-4">
          <button className="w-full h-10 bg-[#002060] text-white rounded-md flex items-center justify-center gap-2 hover:bg-[#00184a] transition">
            <ShoppingCart size={16} />
            Add To Cart
          </button>
        </div>

      </div>
    </div>
  );
};

/* ---------------------------
   Main Component Start
---------------------------- */

// export default function Subcategory() {
//   const [loading, setLoading] = useState(true);

//   const [view, setView] = useState("grid");

//   const [price, setPrice] = useState(100000);

//   const [offer, setOffer] = useState(0);

//   const [selectedBrands, setSelectedBrands] = useState([]);

//   const [selectedSizes, setSelectedSizes] = useState([]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500);

//     return () => clearTimeout(timer);
//   }, []);

//   const brands = [
//     "Samsung",
//     "Boat",
//     "Apple",
//     "LG",
//     "GiftPro",
//     "FrameArt",
//     "Logitech",
//   ];

//   const sizes = ["S", "M", "L", "XL"];

//   const filteredProducts = useMemo(() => {
//     return productsData.filter((product) => {

//       const priceMatch =
//         product.price <= price;

//       const offerMatch =
//         product.discount >= offer;

//       const brandMatch =
//         selectedBrands.length === 0 ||
//         selectedBrands.includes(product.brand);

//       const sizeMatch =
//         selectedSizes.length === 0 ||
//         selectedSizes.includes(product.size);

//       return (
//         priceMatch &&
//         offerMatch &&
//         brandMatch &&
//         sizeMatch
//       );
//     });
//   }, [
//     price,
//     offer,
//     selectedBrands,
//     selectedSizes,
//   ]);
// }

export default function SubCategory() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        SubCategory Page Working
      </h1>
    </div>
  );
}