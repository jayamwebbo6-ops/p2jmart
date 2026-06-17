import React from "react";
import { Send } from "lucide-react";

const sections = [
  {
    title: "Featured Products",
    products: [
      {
        id: 1,
        name: "Samsung C3",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 2,
        name: "Gift Pro 3",
        image:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 3,
        name: "Luxury Frame",
        image:
          "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 4,
        name: "Beauty Kit",
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80",
        discount: "35% OFF",
      },
    ],
  },
  {
    title: "Trending Collections",
    products: [
      {
        id: 5,
        name: "Electronics",
        image:
          "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 6,
        name: "boAt Rockerz",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 7,
        name: "Realme GT",
        image:
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 8,
        name: "Smart Watch",
        image:
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
        discount: "35% OFF",
      },
    ],
  },
  {
    title: "Exclusive Products",
    products: [
      {
        id: 9,
        name: "Stationary",
        image:
          "https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 10,
        name: "Gift Pro 5",
        image:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 11,
        name: "Decor Item",
        image:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80",
        discount: "35% OFF",
      },
      {
        id: 12,
        name: "Premium Phone",
        image:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80",
        discount: "35% OFF",
      },
    ],
  },
];

const Collections = () => {
  return (
    <div className="bg-[#f5f5f5]">
      
      {/* Banner */}
     <section className="bg-[#002050] text-white w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
  <div className="px-6 py-11 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Send size={48} className="text-white/60" />

            <div>
              <h2 className="text-2xl text-white font-semibold">
                Contact Us now
              </h2>

              <p className="text-sm md:text-base text-gray-200 mt-1">
                Explore Our Products Today to get unbelievable Discounts!!
              </p>
            </div>
          </div>

          <button className="bg-[#2c2c2c] hover:bg-black px-10 py-3 rounded-full text-white font-medium transition">
            Explore Our Products
          </button>
        </div>
      </section>

      {/* Products Sections */}
      <section className=" pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-gray-200 p-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-medium text-gray-800">
                  {section.title}
                </h2>

                <button className="text-blue-600 text-sm hover:underline">
                  View All →
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3">
                {section.products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-md p-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
                  >
                    <div className="aspect-square bg-gray-50 rounded overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    <div className="mt-2 flex justify-between items-start gap-2">
                      <h3 className="text-sm text-gray-700 line-clamp-2">
                        {product.name}
                      </h3>

                      <span className="text-blue-600 text-sm font-semibold whitespace-nowrap">
                        {product.discount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Collections;