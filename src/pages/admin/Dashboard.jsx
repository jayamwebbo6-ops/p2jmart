import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  Box, 
  Users, 
  TrendingUp, 
  Eye, 
  ChevronRight,
  Package,
  Zap,
  UserCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Settings,
  Search,
  ArrowUpRight,
  History,
  Loader2,
  Check,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  Info,
  Trash2,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../components/toast';
import PageHeader from '../../components/PageHeader';
import { getProductsAPI, updateProductAPI } from '../../api/productApi';
import { adminGetAllOrdersAPI } from '../../api/orderApi';
import { adminGetAllCustomersAPI } from '../../api/userApi';



const Dashboard = () => {
  const navigate = useNavigate();

  // All orders fetched from backend
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [activeProductsCount, setActiveProductsCount] = useState(0);
  const [storeCustomersCount, setStoreCustomersCount] = useState(0);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Month');

  // Inventory / Low Stock Alert States
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_threshold');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilterType, setStockFilterType] = useState('all');

  // Inputs for restocking
  const [restockInputs, setRestockInputs] = useState({});
  const [restockLoading, setRestockLoading] = useState({});
  const [bulkRestockQty, setBulkRestockQty] = useState('20');
  const [selectedItems, setSelectedItems] = useState([]);

  // Persistent supplier notes and logs
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_supplier_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [restockLogs, setRestockLogs] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_restock_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // ─── Period filter helper ───────────────────────────────────────────────
  const getFilteredOrders = (period, orders) => {
    const now = new Date();
    return orders.filter(ord => {
      const placed = new Date(ord.placedDate || ord.createdAt);
      if (period === 'Today') {
        return placed.toDateString() === now.toDateString();
      } else if (period === 'Yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        return placed.toDateString() === y.toDateString();
      } else if (period === 'Week') {
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        return placed >= weekAgo;
      } else if (period === 'Month') {
        return placed.getMonth() === now.getMonth() && placed.getFullYear() === now.getFullYear();
      } else if (period === 'Year') {
        return placed.getFullYear() === now.getFullYear();
      }
      return true; // 'All' / fallback
    });
  };

  const fetchProductsData = async () => {
    setLoadingProducts(true);
    let loadedProducts = [];

    // 1. Try to load from backend API
    try {
      const res = await getProductsAPI({ includeInactive: 'true' });
      if (res && res.success && res.data && res.data.length > 0) {
        loadedProducts = res.data;
      }
    } catch (err) {
      console.warn("Could not fetch products from backend API, trying local storage", err);
    }

    // 2. Try to load from localStorage catalog if API failed or returned empty
    if (loadedProducts.length === 0) {
      const storedCatalog = localStorage.getItem('p2j_mart_catalog');
      if (storedCatalog) {
        try {
          const catalogData = JSON.parse(storedCatalog);
          const tempProducts = [];
          catalogData.forEach(cat => {
            (cat.subcategories || []).forEach(sub => {
              (sub.products || []).forEach(p => {
                tempProducts.push({
                  ...p,
                  category: cat,
                  subcategory: sub
                });
              });
            });
          });
          if (tempProducts.length > 0) {
            loadedProducts = tempProducts;
          }
        } catch (e) {
          console.error("Error parsing local catalog", e);
        }
      }
    }

    // 3. Fallback to seeded mock products with low stock if no products found anywhere
    if (loadedProducts.length === 0) {
      const mockSeededProducts = [
        {
          id: 'mock-p1',
          _id: 'mock-p1',
          title: 'Premium Wireless Earbuds Pro',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=150&h=150&q=80',
          category: { name: 'Electronics' },
          subcategory: { name: 'Audio' },
          price: 1999,
          variants: [
            { id: 'mock-v1-1', attributes: { color: 'Matte Black' }, price: 1999, stock: 2 },
            { id: 'mock-v1-2', attributes: { color: 'Ceramic White' }, price: 1999, stock: 12 }
          ]
        },
        {
          id: 'mock-p2',
          _id: 'mock-p2',
          title: 'Ergonomic Office Chair',
          image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=150&h=150&q=80',
          category: { name: 'Furniture' },
          subcategory: { name: 'Office' },
          price: 8499,
          variants: [
            { id: 'mock-v2-1', attributes: { color: 'Charcoal Grey' }, price: 8499, stock: 0 }
          ]
        },
        {
          id: 'mock-p3',
          _id: 'mock-p3',
          title: 'Cotton Slim Fit Polo',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&h=150&q=80',
          category: { name: 'Apparel' },
          subcategory: { name: 'Menswear' },
          price: 599,
          variants: [
            { id: 'mock-v3-1', attributes: { color: 'Navy Blue', size: 'M' }, price: 599, stock: 3 },
            { id: 'mock-v3-2', attributes: { color: 'Navy Blue', size: 'L' }, price: 599, stock: 1 },
            { id: 'mock-v3-3', attributes: { color: 'Crimson Red', size: 'M' }, price: 599, stock: 25 }
          ]
        },
        {
          id: 'mock-p4',
          _id: 'mock-p4',
          title: 'Vacuum Insulated Flask',
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=150&h=150&q=80',
          category: { name: 'Home & Kitchen' },
          subcategory: { name: 'Accessories' },
          price: 799,
          variants: [
            { id: 'mock-v4-1', attributes: { color: 'Sleek Silver' }, price: 799, stock: 4 }
          ]
        }
      ];
      loadedProducts = mockSeededProducts;
    }

    setProducts(loadedProducts);
    setActiveProductsCount(loadedProducts.length);
    setLoadingProducts(false);
  };

  useEffect(() => {
    // 1. Fetch real orders from backend
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await adminGetAllOrdersAPI();
        if (res && res.success) setAllOrders(res.data || []);
      } catch (err) {
        console.error('Dashboard: failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    // 2. Fetch real customers from backend
    const fetchCustomers = async () => {
      try {
        const res = await adminGetAllCustomersAPI();
        if (res && res.success) setStoreCustomersCount((res.data || []).length);
      } catch (err) {
        console.error('Dashboard: failed to load customers', err);
      }
    };

    fetchOrders();
    fetchCustomers();
    fetchProductsData();
  }, []);

  // Save low stock threshold in localStorage when modified
  const handleThresholdChange = (val) => {
    const t = parseInt(val, 10) || 0;
    setLowStockThreshold(t);
    localStorage.setItem('p2j_mart_threshold', t.toString());
  };

  // Sync catalog updates in localStorage for local compatibility across pages
  const updateLocalStorageCatalog = (productId, updatedVariants) => {
    const storedCatalog = localStorage.getItem('p2j_mart_catalog');
    if (storedCatalog) {
      try {
        const catalogData = JSON.parse(storedCatalog);
        const updatedCatalog = catalogData.map(cat => ({
          ...cat,
          subcategories: (cat.subcategories || []).map(sub => ({
            ...sub,
            products: (sub.products || []).map(p => {
              if ((p.id || p._id) === productId) {
                return {
                  ...p,
                  variants: updatedVariants
                };
              }
              return p;
            })
          }))
        }));
        localStorage.setItem('p2j_mart_catalog', JSON.stringify(updatedCatalog));
      } catch (e) {
        console.error("Failed to sync catalog storage", e);
      }
    }
  };

  // Extract alerts based on threshold & query
  const getLowStockItems = () => {
    const items = [];
    products.forEach(prod => {
      const hasVariants = prod.variants && prod.variants.length > 0;
      if (hasVariants) {
        prod.variants.forEach((v, idx) => {
          const stockVal = Number(v.stock) || 0;
          const labelParts = [];
          if (v.attributes) {
            Object.entries(v.attributes).forEach(([key, val]) => {
              if (val) {
                const hasPipe = val.includes('|');
                const name = hasPipe ? val.split('|')[0] : val;
                labelParts.push(`${key}: ${name}`);
              }
            });
          }
          const variantLabel = labelParts.join(' / ') || 'Standard Variant';
          
          items.push({
            productId: prod.id || prod._id,
            productTitle: prod.title,
            productImage: v.image || prod.image,
            categoryName: prod.category?.name || (typeof prod.category === 'string' ? prod.category : 'General'),
            subcategoryName: prod.subcategory?.name || (typeof prod.subcategory === 'string' ? prod.subcategory : ''),
            isVariant: true,
            variantId: v.id || `var-${idx}`,
            variantKey: `${prod.id || prod._id}_${v.id || `var-${idx}`}`,
            attributes: v.attributes || {},
            variantLabel,
            stock: stockVal,
            price: v.price,
            rawVariant: v,
            rawProduct: prod
          });
        });
      } else {
        const stockVal = prod.stock !== undefined ? Number(prod.stock) : 10;
        items.push({
          productId: prod.id || prod._id,
          productTitle: prod.title,
          productImage: prod.image,
          categoryName: prod.category?.name || (typeof prod.category === 'string' ? prod.category : 'General'),
          subcategoryName: prod.subcategory?.name || (typeof prod.subcategory === 'string' ? prod.subcategory : ''),
          isVariant: false,
          variantId: 'standard',
          variantKey: `${prod.id || prod._id}_standard`,
          attributes: {},
          variantLabel: 'Standard',
          stock: stockVal,
          price: prod.price,
          rawVariant: null,
          rawProduct: prod
        });
      }
    });

    return items.filter(item => {
      const isOut = item.stock === 0;
      const isLow = item.stock > 0 && item.stock <= lowStockThreshold;
      const meetsStockFilter = 
        stockFilterType === 'all' ? (isOut || isLow) :
        stockFilterType === 'out' ? isOut :
        stockFilterType === 'low' ? isLow : false;

      if (!meetsStockFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.productTitle.toLowerCase().includes(query);
        const matchesCategory = item.categoryName.toLowerCase().includes(query);
        const matchesLabel = item.variantLabel.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesLabel;
      }

      return true;
    });
  };

  // Count unfiltered total alerts
  const getUnfilteredAlertCount = () => {
    let count = 0;
    products.forEach(prod => {
      const hasVariants = prod.variants && prod.variants.length > 0;
      if (hasVariants) {
        prod.variants.forEach(v => {
          if ((Number(v.stock) || 0) <= lowStockThreshold) {
            count++;
          }
        });
      } else {
        const stockVal = prod.stock !== undefined ? Number(prod.stock) : 10;
        if (stockVal <= lowStockThreshold) {
          count++;
        }
      }
    });
    return count;
  };

  const totalAlertsCount = getUnfilteredAlertCount();
  const alertItemsList = getLowStockItems();

  // Restock action for a single item
  const handleRestock = async (item, restockQty) => {
    const qtyToAdd = parseInt(restockQty, 10);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      toast.error('Please enter a valid positive quantity to restock');
      return;
    }

    const { productId, variantId, variantKey, productTitle, variantLabel } = item;

    setRestockLoading(prev => ({ ...prev, [variantKey]: true }));
    try {
      const targetProduct = products.find(p => (p.id || p._id) === productId);
      if (!targetProduct) throw new Error('Product not found');

      let updatedVariants = [];
      if (targetProduct.variants && targetProduct.variants.length > 0) {
        updatedVariants = targetProduct.variants.map(v => {
          if (v.id === variantId) {
            return { ...v, stock: (Number(v.stock) || 0) + qtyToAdd };
          }
          return v;
        });
      } else {
        updatedVariants = [{
          id: 'standard',
          stock: (targetProduct.stock !== undefined ? Number(targetProduct.stock) : 10) + qtyToAdd,
          price: targetProduct.price,
          attributes: {}
        }];
      }

      // Payload for updating product on database
      const payload = {
        ...targetProduct,
        categoryId: targetProduct.category?.id || targetProduct.category?._id || targetProduct.category,
        subcategoryId: targetProduct.subcategory?.id || targetProduct.subcategory?._id || targetProduct.subcategory,
        variants: updatedVariants
      };

      let apiSuccess = false;
      let updatedProductData = null;

      try {
        const res = await updateProductAPI(productId, payload);
        if (res && res.success) {
          apiSuccess = true;
          updatedProductData = res.data;
        }
      } catch (err) {
        console.warn("API restock failed, falling back to local state & storage sync", err);
      }

      // Update state locally
      setProducts(prevProducts => 
        prevProducts.map(p => {
          if ((p.id || p._id) === productId) {
            if (apiSuccess && updatedProductData) {
              return updatedProductData;
            } else {
              return { ...p, variants: updatedVariants };
            }
          }
          return p;
        })
      );

      // Sync catalog in localStorage
      updateLocalStorageCatalog(productId, updatedVariants);

      // Save restock activity log
      const newLog = {
        id: Date.now(),
        productTitle,
        variantLabel: variantLabel !== 'Standard' ? variantLabel : '',
        quantity: qtyToAdd,
        previousStock: item.stock,
        newStock: item.stock + qtyToAdd,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date().toLocaleDateString()
      };
      
      const newLogs = [newLog, ...restockLogs];
      setRestockLogs(newLogs);
      localStorage.setItem('p2j_mart_restock_logs', JSON.stringify(newLogs));

      // Reset individual input field
      setRestockInputs(prev => ({ ...prev, [variantKey]: '' }));
      toast.success(`Restocked ${productTitle} (${variantLabel}) by +${qtyToAdd} units.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock. Please try again.');
    } finally {
      setRestockLoading(prev => ({ ...prev, [variantKey]: false }));
    }
  };

  // Bulk Restock action for all selected items
  const handleBulkRestock = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected for bulk restocking');
      return;
    }

    const qty = parseInt(bulkRestockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid bulk restocking quantity');
      return;
    }

    const itemsToRestock = alertItemsList.filter(item => selectedItems.includes(item.variantKey));
    let successCount = 0;

    for (const item of itemsToRestock) {
      const { productId, variantId, productTitle, variantLabel } = item;
      try {
        const targetProduct = products.find(p => (p.id || p._id) === productId);
        if (!targetProduct) continue;

        let updatedVariants = [];
        if (targetProduct.variants && targetProduct.variants.length > 0) {
          updatedVariants = targetProduct.variants.map(v => {
            if (v.id === variantId) {
              return { ...v, stock: (Number(v.stock) || 0) + qty };
            }
            return v;
          });
        } else {
          updatedVariants = [{
            id: 'standard',
            stock: (targetProduct.stock !== undefined ? Number(targetProduct.stock) : 10) + qty,
            price: targetProduct.price,
            attributes: {}
          }];
        }

        const payload = {
          ...targetProduct,
          categoryId: targetProduct.category?.id || targetProduct.category?._id || targetProduct.category,
          subcategoryId: targetProduct.subcategory?.id || targetProduct.subcategory?._id || targetProduct.subcategory,
          variants: updatedVariants
        };

        try {
          await updateProductAPI(productId, payload);
        } catch (err) {
          // Fall back to local update
        }

        // Update state locally
        setProducts(prevProducts => 
          prevProducts.map(p => {
            if ((p.id || p._id) === productId) {
              return { ...p, variants: updatedVariants };
            }
            return p;
          })
        );

        // Sync catalog in localStorage
        updateLocalStorageCatalog(productId, updatedVariants);

        // Save restock activity log
        const newLog = {
          id: Date.now() + Math.random(),
          productTitle,
          variantLabel: variantLabel !== 'Standard' ? variantLabel : '',
          quantity: qty,
          previousStock: item.stock,
          newStock: item.stock + qty,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: new Date().toLocaleDateString()
        };

        setRestockLogs(prev => {
          const updated = [newLog, ...prev];
          localStorage.setItem('p2j_mart_restock_logs', JSON.stringify(updated));
          return updated;
        });

        successCount++;
      } catch (err) {
        console.error(`Failed bulk restock for ${productTitle}`, err);
      }
    }

    setSelectedItems([]);
    toast.success(`Successfully bulk restocked ${successCount} items by +${qty} units.`);
  };

  // Supplier note handler
  const handleSaveNote = (variantKey, noteText) => {
    const updatedNotes = {
      ...notes,
      [variantKey]: noteText
    };
    setNotes(updatedNotes);
    localStorage.setItem('p2j_mart_supplier_notes', JSON.stringify(updatedNotes));
  };

  // Toggle selection for bulk actions
  const handleSelectItem = (variantKey) => {
    setSelectedItems(prev => 
      prev.includes(variantKey) 
        ? prev.filter(k => k !== variantKey) 
        : [...prev, variantKey]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedItems(alertItemsList.map(item => item.variantKey));
    } else {
      setSelectedItems([]);
    }
  };

  // Export inventory alerts as CSV
  const handleExportCSV = () => {
    if (alertItemsList.length === 0) {
      toast.error('No alerts to export');
      return;
    }

    const headers = ['Product Title', 'Variant', 'Category', 'Subcategory', 'Current Stock', 'Price (INR)', 'Supplier Notes'];
    const rows = alertItemsList.map(item => [
      `"${item.productTitle}"`,
      `"${item.variantLabel}"`,
      `"${item.categoryName}"`,
      `"${item.subcategoryName}"`,
      item.stock,
      item.price,
      `"${notes[item.variantKey] || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Low stock inventory report exported successfully.');
  };

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Compute stats from real filtered orders
  const filteredOrders = getFilteredOrders(dateFilter, allOrders);
  const totalRevenueVal = filteredOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalOrdersVal = filteredOrders.length;
  // Most recent 5 for the activity table
  const recentOrders = [...allOrders]
    .sort((a, b) => new Date(b.placedDate || b.createdAt) - new Date(a.placedDate || a.createdAt))
    .slice(0, 5);

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen bg-[#f4f5f8] p-4 -m-4">
      {/* Top Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of your store's activity & stock control"
      >
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-slate-855 text-xs sm:text-sm"
          >
            <Calendar className="text-primary w-4 h-4" />
            <span>{dateFilter}</span>
            {isFilterDropdownOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
          
          {isFilterDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {['Today', 'Yesterday', 'Week', 'Month', 'Year', 'Custom'].map((opt) => {
                  const isActive = dateFilter === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateFilter(opt);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-primary text-white shadow-[0_4px_10px_rgba(0,49,71,0.2)]' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </PageHeader>

      {/* Top Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500">Total Revenue</span>
            <span className="text-[28px] font-black text-slate-900 mt-2 tracking-tight">
              {loadingOrders ? '...' : formatCurrency(totalRevenueVal)}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-2">{dateFilter} — live from database</span>
          </div>
          <div className="w-12 h-12 rounded-[16px] border border-gray-250 flex items-center justify-center text-slate-700 shrink-0">
            <Wallet size={20} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-purple-500">Total Orders</span>
            <span className="text-[28px] font-black text-slate-900 mt-2 tracking-tight">
              {loadingOrders ? '...' : totalOrdersVal}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-2">{dateFilter} — live from database</span>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 3: Active Products */}
        <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-500">Active Products</span>
            <span className="text-[28px] font-black text-slate-900 mt-2 tracking-tight">
              {activeProductsCount}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-2">Currently in store database</span>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Box size={20} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 4: Store Customers */}
        <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">Store Customers</span>
            <span className="text-[28px] font-black text-slate-900 mt-2 tracking-tight">
              {storeCustomersCount}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-2">Registered buyers</span>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users size={20} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4 gap-2 bg-white p-2 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setActiveDashboardTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeDashboardTab === 'overview'
              ? 'bg-[#003147] text-white shadow-md shadow-slate-950/15'
              : 'text-slate-500 hover:text-[#003147] hover:bg-slate-50'
          }`}
        >
          <TrendingUp size={14} />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('low-stock')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all relative ${
            activeDashboardTab === 'low-stock'
              ? 'bg-[#003147] text-white shadow-md shadow-slate-950/15'
              : 'text-slate-500 hover:text-[#003147] hover:bg-slate-50'
          }`}
        >
          <AlertTriangle size={14} className={totalAlertsCount > 0 ? "text-amber-500 animate-bounce" : ""} />
          <span>Low Stock Alert Center</span>
          {totalAlertsCount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1 animate-pulse">
              {totalAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeDashboardTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Left Card: Recent Activity (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-650 shrink-0 shadow-sm">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Latest 5 orders placed</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/admin/orders')}
                  className="text-[11px] font-extrabold text-blue-700 hover:text-red-800 transition-colors flex items-center gap-1"
                >
                  <span>View All</span>
                  <span>➔</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[9px] font-bold">
                      <th className="pb-3.5 font-bold">Order ID</th>
                      <th className="pb-3.5 font-bold">Customer</th>
                      <th className="pb-3.5 font-bold">Amount</th>
                      <th className="pb-3.5 font-bold text-center">Status</th>
                      <th className="pb-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {loadingOrders ? (
                      <tr><td colSpan="5" className="text-center py-10">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <RefreshCw size={14} className="animate-spin" />
                          <span className="text-xs font-semibold">Loading orders...</span>
                        </div>
                      </td></tr>
                    ) : recentOrders.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-medium">No orders found in database.</td></tr>
                    ) : recentOrders.map((ord) => {
                      const statusLower = (ord.status || '').toLowerCase();
                      const badgeColorMap = {
                        processing: 'bg-yellow-50 text-yellow-700',
                        pending:    'bg-amber-50 text-amber-700',
                        shipped:    'bg-blue-50 text-blue-700',
                        delivered:  'bg-green-50 text-green-700',
                        cancelled:  'bg-red-50 text-red-500',
                      };
                      const badgeClass = badgeColorMap[statusLower] || 'bg-slate-50 text-slate-500';
                      const customerName = ord.shippingAddress?.fullName || 'Customer';
                      const customerPhone = ord.shippingAddress?.phoneNumber || '';
                      return (
                        <tr key={ord._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 font-bold text-slate-900 font-mono text-[11px]">{ord.orderId}</td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900">{customerName}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5">{customerPhone}</span>
                            </div>
                          </td>
                          <td className="py-4 font-extrabold text-slate-900">{formatCurrency(ord.total || 0)}</td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-normal ${badgeClass}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => navigate('/admin/orders')}
                              className="w-7 h-7 rounded-full bg-slate-50 border border-gray-150 hover:bg-slate-100 text-slate-400 hover:text-slate-650 flex items-center justify-center transition-colors mx-auto"
                              title="View Order"
                            >
                              <Eye size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS CONTROL CENTER */}
      {activeDashboardTab === 'low-stock' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Analytical Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stat 1: Total Alerts */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-105 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock Alerts Flagged</span>
                <span className="text-2xl font-black text-gray-900 mt-1">{totalAlertsCount} items</span>
                <span className="text-[10px] text-gray-450 mt-1">Currently below threshold ({lowStockThreshold} units)</span>
              </div>
            </div>

            {/* Stat 2: Out of Stock */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-105 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Out of Stock Count</span>
                <span className="text-2xl font-black text-gray-900 mt-1">
                  {products.reduce((acc, p) => acc + (p.variants && p.variants.length > 0 
                    ? p.variants.filter(v => (v.stock || 0) === 0).length 
                    : ((p.stock || 0) === 0 ? 1 : 0)), 0)} items
                </span>
                <span className="text-[10px] text-gray-450 mt-1">Require immediate restocking action</span>
              </div>
            </div>
          </div>

          {/* Low Stock control panels card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
            
            {/* Toolbar section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
              
              {/* Left Column: Filter and Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                {/* Search */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search by title, variant or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary bg-white font-semibold"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Stock filter toggles */}
                <div className="flex bg-slate-50 border border-gray-200 p-1 rounded-xl text-xs font-bold text-gray-600 shrink-0 select-none">
                  <button
                    onClick={() => setStockFilterType('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${stockFilterType === 'all' ? 'bg-[#003147] text-white shadow-xs' : 'hover:bg-slate-100'}`}
                  >
                    All Alerts
                  </button>
                  <button
                    onClick={() => setStockFilterType('out')}
                    className={`px-3 py-1 rounded-lg transition-all ${stockFilterType === 'out' ? 'bg-[#003147] text-white shadow-xs' : 'hover:bg-slate-100'}`}
                  >
                    Out of Stock
                  </button>
                  <button
                    onClick={() => setStockFilterType('low')}
                    className={`px-3 py-1 rounded-lg transition-all ${stockFilterType === 'low' ? 'bg-[#003147] text-white shadow-xs' : 'hover:bg-slate-100'}`}
                  >
                    Low Stock
                  </button>
                </div>
              </div>

              {/* Right Column: Threshold config slider & Export */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Threshold slider */}
                <div className="flex items-center gap-2 border border-gray-200 bg-slate-50/50 px-3 py-1.5 rounded-xl">
                  <Settings size={14} className="text-gray-400" />
                  <span className="text-xs font-black text-gray-700">Threshold:</span>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={lowStockThreshold}
                    onChange={(e) => handleThresholdChange(e.target.value)}
                    className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003147]"
                  />
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                    {lowStockThreshold} qty
                  </span>
                </div>

                {/* Export button */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-white border border-gray-250 hover:bg-slate-50 hover:border-gray-350 text-slate-700 text-xs px-3.5 py-2 rounded-xl transition-all font-bold shadow-xs"
                  title="Export Low Stock to CSV"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Bulk Restock bar (visible only when items are selected) */}
            {selectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-150">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    Selected <strong className="font-extrabold">{selectedItems.length}</strong> items for bulk restock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-800">Add Quantity:</span>
                  <input
                    type="number"
                    min="1"
                    value={bulkRestockQty}
                    onChange={(e) => setBulkRestockQty(e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs text-center font-bold outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                  <button
                    onClick={handleBulkRestock}
                    className="bg-[#003147] hover:bg-[#002535] text-white text-xs px-4 py-1.5 rounded-lg font-black transition-all shadow-xs flex items-center gap-1"
                  >
                    Restock Selected
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-xs font-bold text-gray-500 hover:text-red-600 px-2 py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Main Low Stock Table */}
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <RefreshCw className="text-gray-300 w-8 h-8 animate-spin mb-3" />
                <span className="text-xs font-bold text-gray-400">Loading catalog inventory...</span>
              </div>
            ) : alertItemsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-2xl border border-dashed border-gray-200">
                <Box className="w-12 h-12 text-gray-300 mb-3" />
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">No Low Stock Alerts</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-xs text-center">
                  All active items are healthy and exceed the low stock alert threshold of {lowStockThreshold} units.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-450 uppercase tracking-widest text-[9px] font-bold">
                      <th className="pb-3 px-3 w-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === alertItemsList.length && alertItemsList.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-[#003147] focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="pb-3 px-3 font-bold">Product Item</th>
                      <th className="pb-3 px-3 font-bold">Attributes</th>
                      <th className="pb-3 px-3 font-bold text-center">Inventory Level</th>
                      <th className="pb-3 px-3 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alertItemsList.map((item) => {
                      const isOutOfStock = item.stock === 0;
                      const restockValue = restockInputs[item.variantKey] || '';
                      const isUpdating = restockLoading[item.variantKey];
                      
                      // Progress bar math
                      const progressPercentage = Math.min((item.stock / (lowStockThreshold * 2 || 10)) * 100, 100);
                      const progressBarColor = isOutOfStock 
                        ? 'bg-rose-500' 
                        : item.stock <= lowStockThreshold 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500';

                      return (
                        <tr key={item.variantKey} className="hover:bg-slate-50/50 transition-colors">
                          {/* Selection Checkbox */}
                          <td className="py-4 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.variantKey)}
                              onChange={() => handleSelectItem(item.variantKey)}
                              className="rounded border-gray-300 text-[#003147] focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Product Detail info */}
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-white shrink-0 shadow-xs flex items-center justify-center">
                                <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-[11px] font-black text-slate-900 leading-tight line-clamp-1">{item.productTitle}</h4>
                                <span className="text-[9px] text-gray-400 font-extrabold uppercase mt-0.5 block tracking-wider">
                                  {item.categoryName} ➔ {item.subcategoryName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Attributes / Variant tag */}
                          <td className="py-4 px-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-gray-700 bg-slate-50 border border-gray-150 px-2 py-0.5 rounded-lg w-max max-w-[150px] truncate">
                                {item.variantLabel}
                              </span>
                              <span className="text-[9px] font-semibold text-purple-600 block">
                                Price: ₹{item.price.toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Inventory stock level with Visual Progress Bar */}
                          <td className="py-4 px-3 w-[160px]">
                            <div className="flex flex-col gap-1.5 justify-center">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black tracking-normal ${
                                  isOutOfStock ? 'text-rose-600' : 'text-amber-600'
                                }`}>
                                  {item.stock} / {lowStockThreshold} units
                                </span>
                                <span className={`text-[8px] font-black uppercase px-1 rounded-sm border ${
                                  isOutOfStock 
                                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                                </span>
                              </div>
                              
                              {/* Visual progress track */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-350 ${progressBarColor}`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Quick restock input controls */}
                          <td className="py-4 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Small presets */}
                              <div className="hidden sm:flex items-center gap-1 select-none">
                                {[5, 10, 20].map(qty => (
                                  <button
                                    key={qty}
                                    onClick={() => handleRestock(item, qty)}
                                    disabled={isUpdating}
                                    className="px-1.5 py-1 bg-white hover:bg-slate-50 border border-gray-200 hover:border-gray-300 rounded text-[9px] font-black text-slate-700 transition-colors disabled:opacity-30"
                                    title={`Add +${qty} quantity`}
                                  >
                                    +{qty}
                                  </button>
                                ))}
                              </div>

                              {/* Custom input */}
                              <input
                                type="number"
                                placeholder="Qty"
                                min="1"
                                value={restockValue}
                                disabled={isUpdating}
                                onChange={(e) => setRestockInputs(prev => ({ ...prev, [item.variantKey]: e.target.value }))}
                                className="w-12 border border-gray-250 px-1 py-1 rounded text-center text-[10px] font-extrabold outline-none focus:ring-1 focus:ring-primary bg-white disabled:opacity-50"
                              />

                              {/* Restock button */}
                              <button
                                onClick={() => handleRestock(item, restockValue)}
                                disabled={isUpdating || !restockValue}
                                className="bg-[#003147] hover:bg-[#002232] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center w-14 shrink-0 min-h-[26px]"
                              >
                                {isUpdating ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <span>Restock</span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
