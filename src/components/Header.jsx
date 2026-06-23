import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../utils/constants';
import { isUserAuthenticated, userLogout } from '../api/userApi';

// Dummy Product Dataset for Search Engine Filtering
const DUMMY_PRODUCTS = [
  { 
    id: 'p1', 
    title: 'Premium Handcrafted Brass Ganesha Idol (Premium Gold Finish, 8-inch)', 
    brand: 'VedicArts Craft', 
    category: 'Devotional Idols', 
    image: 'https://images.unsplash.com/photo-1609137144813-7d722e1a3bc0?w=300&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'p2', 
    title: 'Antique Brass Om Puja Thali Set with Murugan Vel & Oil Lamp', 
    brand: 'Divine Home', 
    category: 'Pooja Essentials', 
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'p3', 
    title: 'Pure Sterling Silver Lord Murugan Statue for Home Mandir', 
    brand: 'SilverLine Creations', 
    category: 'Premium Silverware', 
    image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?w=300&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'p4', 
    title: 'Luxury 24k Gold-Plated Lakshmi & Ganesha Teakwood Photo Frame', 
    brand: 'Joy Gift House', 
    category: 'Wall Decor Frames', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'p5', 
    title: 'Hand-Painted Traditional Clay Terracotta Diya Box (Pack of 12)', 
    brand: 'Utsav Krafts', 
    category: 'Festival Decorations', 
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=300&auto=format&fit=crop&q=80' 
  }
];

const Header = memo(({ wishlist = [], cart = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Basic Nav States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Advanced Search Functionality States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const searchContainerRef = useRef(null);

  const [isAuthenticated, setIsAuthenticated] = useState(isUserAuthenticated());
  const [userProfile, setUserProfile] = useState(null);

  // Load Recently Viewed from LocalStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('p2j_recently_viewed');
    if (cached) {
      setRecentlyViewed(JSON.parse(cached));
    }
  }, []);

  const checkAuth = useCallback(() => {
    const authStatus = isUserAuthenticated();
    setIsAuthenticated(authStatus);
    if (authStatus) {
      const stored = localStorage.getItem('p2j_user_profile');
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('userLoginStateChange', checkAuth);
    return () => window.removeEventListener('userLoginStateChange', checkAuth);
  }, [checkAuth]);

  // Handle Search Input Change to Trim Starting Whitespace
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Regex trims leading spaces/whitespaces immediately but keeps spaces between words
    setSearchQuery(value.replace(/^\s+/, ''));
  };

  // Handle Search Result item tracking updates
  const handleItemClick = (product) => {
    let currentRecent = [...recentlyViewed];
    currentRecent = currentRecent.filter(item => item.id !== product.id);
    currentRecent.unshift(product);
    const updatedRecent = currentRecent.slice(0, 5); // Max 5 items cached
    
    setRecentlyViewed(updatedRecent);
    localStorage.setItem('p2j_recently_viewed', JSON.stringify(updatedRecent));
    
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    navigate(`/products/${product.id}`);
  };

  const clearRecentlyViewed = (e) => {
    e.stopPropagation();
    setRecentlyViewed([]);
    localStorage.removeItem('p2j_recently_viewed');
  };

  // Filter Data Dynamically based on input matches
 // Clean the query once before filtering for better performance
const cleanedQuery = searchQuery.trim().toLowerCase();

const filteredProducts = DUMMY_PRODUCTS.filter(p => 
  p.title.toLowerCase().includes(cleanedQuery) ||
  p.brand.toLowerCase().includes(cleanedQuery) ||
  p.category.toLowerCase().includes(cleanedQuery)
);

  const uniqueBrands = [...new Set(filteredProducts.map(p => p.brand))];
  const uniqueCategories = [...new Set(filteredProducts.map(p => p.category))];

  const isActive = (path) => {
    const normalize = (p) => {
      let val = p.trim();
      if (!val.startsWith('/')) val = '/' + val;
      if (val.length > 1 && val.endsWith('/')) val = val.slice(0, -1);
      return val;
    };
    const current = normalize(location.pathname);
    const target = normalize(path);
    return target === '/' ? current === '/' : current.startsWith(target) 
      ? 'text-secondary font-bold' 
      : 'text-gray-700 font-medium hover:text-secondary';
  };

  const isActiveMobile = (path) => {
    const normalize = (p) => {
      let val = p.trim();
      if (!val.startsWith('/')) val = '/' + val;
      if (val.length > 1 && val.endsWith('/')) val = val.slice(0, -1);
      return val;
    };
    const current = normalize(location.pathname);
    const target = normalize(path);
    return target === '/' ? current === '/' : current.startsWith(target)
      ? 'text-secondary font-bold' 
      : 'text-gray-800 font-medium hover:text-secondary';
  };

  // Click outside to close menus wrapper logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = useCallback((index) => {
    setOpenCategoryIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:flex w-full bg-primary text-white text-xs py-2 px-4 md:px-8 lg:px-12 justify-between items-center font-sans">
        <div>
          <span className="tracking-wide text-[12px] text-white">Free Shipping Over ₹500</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/track-order" className="hidden sm:block hover:text-gray-300 transition-colors tracking-wide">Track your order</Link>
          <span className="hidden sm:block w-px h-3 bg-gray-400 opacity-50"></span>
          <Link to="/support" className="hover:text-gray-300 transition-colors tracking-wide">Need support?</Link>
          <div className="flex items-center space-x-3 pl-2">
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaFacebookF size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaXTwitter size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaYoutube size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaInstagram size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="w-full bg-white px-4 md:px-8 lg:px-12 py-0 flex justify-between items-center sticky top-0 z-[100] border-b border-gray-200 font-sans shadow-sm">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="P2J Mart Logo" 
              className="h-16 md:h-23 w-auto object-contain py-1"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
          <Link to="/products" className={`${isActive('/products')} transition-colors`}>Products</Link>
          <Link to="/customized" className={`${isActive('/customized')} transition-colors`}>Customized Products</Link>
          <Link to="/contact" className={`${isActive('/contact')} transition-colors`}>Contact Us</Link>
        </nav>

        {/* Search Engine Workspace Area */}
        <div className="flex items-center space-x-4 md:space-x-6">
          
          {/* Desktop Search Dropdown Shell Configuration */}
          <div className="relative hidden lg:block" ref={searchContainerRef}>
            <div className={`flex items-center border rounded-full w-80 transition-all px-1 py-0.5 ${isSearchFocused ? 'border-primary ring-2 ring-primary/10' : 'border-gray-300'}`}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search gifts, brands..." 
                className="w-full bg-transparent py-2 pl-4 pr-2 text-sm focus:outline-none"
              />
              <button className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition-opacity shrink-0">
                <Search size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Float Floating Results Dropdown Box */}
            {isSearchFocused && (
              <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-4 px-4 max-h-[420px] overflow-y-auto z-[250] font-sans">
                {searchQuery.trim() === '' ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Recently Viewed</span>
                      {recentlyViewed.length > 0 && (
                        <button onClick={clearRecentlyViewed} className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">Clear All</button>
                      )}
                    </div>
                    {recentlyViewed.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">No recent items viewed.</p>
                    ) : (
                      <div className="space-y-2">
                        {recentlyViewed.map(product => (
                          <div key={product.id} onClick={() => handleItemClick(product)} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{product.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Segment 1: Products */}
                    <div>
                      <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">Products</h4>
                      {filteredProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 pl-1">No products found matching filters.</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredProducts.slice(0, 5).map(product => (
                            <div key={product.id} onClick={() => handleItemClick(product)} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                              <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                              <span className="text-xs font-semibold text-gray-800 line-clamp-1">{product.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Segment 2: Brands Dynamic Badges */}
                    {uniqueBrands.length > 0 && (
                      <div className="border-t border-gray-50 pt-3">
                        <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">Brands</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueBrands.map((brand, i) => (
                            <span key={i} onClick={() => setSearchQuery(brand)} className="bg-primary/90 text-white border border-red-100 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Segment 3: Categories Dynamic Framework */}
                    {uniqueCategories.length > 0 && (
                      <div className="border-t border-gray-50 pt-3">
                        <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-1.5">Categories</h4>
                        <div className="flex flex-col gap-1 pl-1">
                          {uniqueCategories.map((cat, i) => (
                            <span key={i} onClick={() => setSearchQuery(cat)} className="text-xs font-bold text-gray-600 hover:text-primary cursor-pointer py-1 transition-colors block">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Glass Trigger Button (Mobile View Routing) */}
          <button onClick={() => setIsMobileSearchOpen(true)} className="lg:hidden text-gray-700 hover:text-primary transition-colors">
            <Search size={22} strokeWidth={2} />
          </button>

          {/* Layout Configuration Badges */}
          <div className="flex items-center space-x-4 md:space-x-5 text-primary">
            <Link to="/wishlist" className="hover:text-secondary transition-colors hover:scale-110 transform relative block">
              <Heart size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-secondary text-white text-[0.6rem] font-bold min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full border border-white shadow-sm">
                {wishlist.length}
              </span>
            </Link>

            <Link to="/cart" className="hover:text-secondary transition-colors hover:scale-110 transform relative block">
              <ShoppingBag size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border border-white">
                {cart.length}
              </span>
            </Link>
            
            {/* User Profile Dropdown Setup */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="hover:text-secondary transition-colors hover:scale-110 transform flex items-center focus:outline-none">
                {isAuthenticated && userProfile?.photo ? (
                  <img src={userProfile.photo} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                ) : (
                  <User size={24} strokeWidth={1.5} />
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white rounded-lg shadow-xl py-2 z-[200] border border-gray-100">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{userProfile?.name || 'My Account'}</p>
                      </div>
                      <Link to="/my-account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors" onClick={() => setIsUserMenuOpen(false)}>My Account</Link>
                      <button onClick={() => { setIsUserMenuOpen(false); userLogout(); setIsAuthenticated(false); setUserProfile(null); window.location.href = '/'; }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50 cursor-pointer">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary font-semibold transition-colors" onClick={() => setIsUserMenuOpen(false)}>Login</Link>
                  )}
                </div>
              )}
            </div>

            <button className="lg:hidden ml-1 text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Full Mobile Search Modal Overlay Layer */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex justify-center items-start pt-16 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 relative transform transition-all duration-300 scale-100">
            <button onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }} className="absolute -top-3 -right-3 bg-white text-gray-700 p-1.5 rounded-full shadow-lg hover:text-red-500 border border-gray-100 transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center border border-primary/80 rounded-full px-3 py-1.5 bg-white shadow-inner mb-4">
              <Search size={18} className="text-primary mr-2 shrink-0" />
              <input 
                type="text"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for products, brands, and more..."
                className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
              {searchQuery.trim() === '' ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">Recently Viewed</span>
                    {recentlyViewed.length > 0 && (
                      <button onClick={clearRecentlyViewed} className="text-xs font-bold text-gray-400 hover:text-red-500">Clear All</button>
                    )}
                  </div>
                  {recentlyViewed.length === 0 ? (
                    <p className="text-xs text-gray-400 py-1">No items recently viewed.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {recentlyViewed.map(p => (
                        <div key={p.id} onClick={() => handleItemClick(p)} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-md border" />
                          <span className="text-xs font-medium text-gray-700 truncate">{p.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">Products</h4>
                    {filteredProducts.length === 0 ? (
                      <p className="text-xs text-gray-400">No products match search criteria.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredProducts.map(p => (
                          <div key={p.id} onClick={() => handleItemClick(p)} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-md border" />
                            <span className="text-xs font-semibold text-gray-800 line-clamp-1">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {uniqueBrands.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-1.5">Brands</h4>
                      <div className="flex flex-wrap gap-1">
                        {uniqueBrands.map((b, i) => (
                          <span key={i} onClick={() => setSearchQuery(b)} className="bg-red-50 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu Layout Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-16 object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`${isActiveMobile('/')} text-base transition-colors`}>Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className={`${isActiveMobile('/products')} text-base transition-colors`}>Products</Link>
              <Link to="/customized" onClick={() => setIsMobileMenuOpen(false)} className={`${isActiveMobile('/customized')} text-base transition-colors`}>Customized Products</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`${isActiveMobile('/contact')} text-base transition-colors`}>Contact Us</Link>
            </div>

            <div className="p-4">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Categories</h3>
              <ul className="flex flex-col space-y-1">
                {categories.map((cat, idx) => (
                  <li key={idx} className="border-b border-gray-50 last:border-0 pb-1">
                    <button onClick={() => toggleCategory(idx)} className="w-full flex justify-between items-center py-2 text-gray-700 hover:text-primary transition-colors font-medium">
                      <span>{cat.name}</span>
                      {openCategoryIndex === idx ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {openCategoryIndex === idx && (
                      <ul className="pl-4 py-2 space-y-3 bg-gray-50/80 rounded-md mt-1 mb-2 border-l-2 border-primary/30">
                        {cat.subcategories.map((sub, i) => (
                          <li key={i}>
                            <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-sm hover:text-primary transition-colors block">{sub}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;