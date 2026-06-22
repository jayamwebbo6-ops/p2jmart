import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Users as UsersIcon, 
  ShieldCheck, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { toast } from '../../components/toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { DeleteBtn, ViewBtn } from '../../components/AdminButtons';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Mani Kandan R',
    email: 'manikandan110305@gmail.com',
    phone: '7826920882',
    orders: 8,
    totalSpent: 14598,
    lastOrder: '2026-06-16',
    status: 'Active',
    joinedDate: '2026-06-01',
    address: 'No 45, Anna Nagar First Street, Chennai, Tamil Nadu'
  },
  {
    id: 'cust-2',
    name: 'Sridhar J',
    email: 'jayamproj@gmail.com',
    phone: '1234567895',
    orders: 1,
    totalSpent: 400,
    lastOrder: '2026-06-12',
    status: 'Active',
    joinedDate: '2026-06-10',
    address: 'Flat 3B, Sunshine Apartments, Gandhi Road, Chennai, Tamil Nadu'
  },
  {
    id: 'cust-3',
    name: 'Joy gift House',
    email: 'joygifthouse29@gmail.com',
    phone: '9962799150',
    orders: 1,
    totalSpent: 400,
    lastOrder: '2026-05-30',
    status: 'Active',
    joinedDate: '2026-05-15',
    address: '32, Brigade Road, Opposite Metro Station, Bangalore, Karnataka'
  },
  {
    id: 'cust-4',
    name: 'joytraders29',
    email: 'joytraders29@gmail.com',
    phone: '9962799151',
    orders: 4,
    totalSpent: 1650,
    lastOrder: '2026-05-30',
    status: 'Active',
    joinedDate: '2026-05-22',
    address: 'Suite 405, Nariman Point, Mumbai, Maharashtra'
  },
  {
    id: 'cust-5',
    name: 'Ananya Sharma',
    email: 'ananya.s@example.com',
    phone: '9876543210',
    orders: 12,
    totalSpent: 28450,
    lastOrder: '2026-06-19',
    status: 'Active',
    joinedDate: '2026-04-10',
    address: 'Sector 15, Block C-204, Noida, Uttar Pradesh'
  },
  {
    id: 'cust-6',
    name: 'Rahul Verma',
    email: 'rahul.v@example.com',
    phone: '8765432109',
    orders: 0,
    totalSpent: 0,
    lastOrder: null,
    status: 'Inactive',
    joinedDate: '2026-06-18',
    address: 'Salt Lake Sector V, Block EP, Kolkata, West Bengal'
  }
];

const Users = () => {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading customers', e);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'joinedDate', direction: 'desc' });

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('p2j_mart_customers', JSON.stringify(customers));
  }, [customers]);

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  // Formatting Helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Avatar background colors based on name hash
  const getAvatarBg = (name) => {
    const colors = [
      'bg-blue-150 text-blue-700 border-blue-200',
      'bg-emerald-150 text-emerald-700 border-emerald-200',
      'bg-indigo-150 text-indigo-700 border-indigo-200',
      'bg-rose-150 text-rose-700 border-rose-200',
      'bg-amber-150 text-amber-700 border-amber-200',
      'bg-purple-150 text-purple-700 border-purple-200',
      'bg-teal-150 text-teal-700 border-teal-200'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Handle CRUD Actions
  const handleOpenDetail = (customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleDeleteCustomer = (id, name, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Customer Account',
      `Are you sure you want to permanently delete customer "${name}"? This will erase their contact details and historic statistics. This action is irreversible.`,
      () => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        toast.success(`Customer "${name}" deleted successfully.`);
        if (selectedCustomer && selectedCustomer.id === id) {
          setDetailModalOpen(false);
        }
      }
    );
  };

  const handleUpdateStatusInDetail = (status) => {
    if (!selectedCustomer) return;
    const updated = { ...selectedCustomer, status };
    setSelectedCustomer(updated);
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    toast.success(`Customer status updated to ${status}.`);
  };

  // Sorting Handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic
  const filteredCustomers = customers
    .filter(c => {
      // Search filter
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort logic
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle null last orders for proper sorting
      if (sortConfig.key === 'lastOrder') {
        aVal = aVal || '0000-00-00';
        bVal = bVal || '0000-00-00';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate Metrics
  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      <PageHeader
        title="Customer Registry"
        subtitle="Analyze client accounts, historical ordering trends, spent revenues, and profiles."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3General Information">
        {/* Total Customers */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <UsersIcon size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Clients</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{totalCustomers}</span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Active Accounts</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">
              {activeCount}
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Sales</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Avg. Order Value</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{formatCurrency(avgOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search customers by name, email, phone or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <AdminTable
        headers={[
          { key: 'name', label: 'Customer',  },
          { key: 'email', label: 'Contact Info', },
          { key: 'orders', label: 'Orders',  align: 'center' },
          { key: 'totalSpent', label: 'Total Spent', align: 'right' },
          { key: 'lastOrder', label: 'Last Order', },
          { key: 'status', label: 'Status',align: 'center' },
          { key: 'actions', label: 'Actions', align: 'center' }
        ]}
        data={filteredCustomers}
        onSort={handleSort}
        sortConfig={sortConfig}
        containerClassName="border border-gray-200/80 rounded-xl overflow-hidden"
        emptyMessage={
          <div className="flex flex-col items-center justify-center gap-3">
            <UsersIcon size={32} className="text-gray-300" />
            <span>No matching customers found.</span>
          </div>
        }
        renderRow={(customer) => (
          <tr 
            key={customer.id}
            onClick={() => handleOpenDetail(customer)}
            className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
          >
            {/* Customer Identity */}
            <td className="py-4 px-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${getAvatarBg(customer.name)}`}>
                  {getInitials(customer.name)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-gray-900 group-hover:text-primary transition-colors block truncate">
                    {customer.name}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    Joined {new Date(customer.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </td>

            {/* Contact Info */}
            <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline">
                  <Mail size={12} className="text-gray-400" />
                  <span>{customer.email}</span>
                </a>
                <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline">
                  <Phone size={12} className="text-gray-400" />
                  <span>{customer.phone}</span>
                </a>
              </div>
            </td>

            {/* Orders */}
            <td className="py-4 px-6 text-center font-semibold text-gray-800">
              {customer.orders}
            </td>

            {/* Total Spent */}
            <td className="py-4 px-6 text-right font-bold text-gray-900">
              {formatCurrency(customer.totalSpent)}
            </td>

            {/* Last Order Date */}
            <td className="py-4 px-6 text-gray-500 font-medium">
              {formatDate(customer.lastOrder)}
            </td>

            {/* Status Badges */}
            <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                customer.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                {customer.status}
              </span>
            </td>

            {/* Action Buttons */}
            <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center gap-2">
                <ViewBtn
                  onClick={() => handleOpenDetail(customer)}
                  title="View Details"
                  size={14}
                />
                <DeleteBtn
                  size={14}
                  onClick={(e) => handleDeleteCustomer(customer.id, customer.name, e)}
                  title="Delete Customer"
                />
              </div>
            </td>
          </tr>
        )}
      />

      {/* Table footer info */}
      <div className="bg-gray-50/50 border border-gray-250 border-t-0 rounded-b-xl px-6 py-4 flex items-center justify-between text-[11px] font-medium text-gray-500 -mt-[1px] relative z-10">
        <span>Showing {filteredCustomers.length} of {totalCustomers} customers</span>
        {statusFilter !== 'All' && (
          <span>Filtered by status: <strong>{statusFilter}</strong></span>
        )}
      </div>


      {/* ==========================================
          CUSTOMER DETAILS POPUP MODAL
         ========================================== */}
      {detailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-gray-150 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-bold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={15} className="text-primary" />
                Customer Account Sheet
              </span>
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-6 border-b border-gray-100/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 ${getAvatarBg(selectedCustomer.name)}`}>
                {getInitials(selectedCustomer.name)}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedCustomer.name}
                  </h3>
                  <div className="self-center sm:self-auto">
                    <select
                      value={selectedCustomer.status}
                      onChange={(e) => handleUpdateStatusInDetail(e.target.value)}
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold border outline-none cursor-pointer ${
                        selectedCustomer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <span className="text-xs text-gray-400 block mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar size={12} />
                  Client since {formatDate(selectedCustomer.joinedDate)}
                </span>
              </div>
            </div>

            {/* Split Info Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/20">
              
              {/* Contact Card */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact Information
                </h4>
                
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3.5 shadow-sm">
                  <a 
                    href={`mailto:${selectedCustomer.email}`} 
                    className="flex items-start gap-3 text-xs text-gray-600 hover:text-blue-600 group/link"
                  >
                    <Mail size={15} className="text-gray-400 group-hover/link:text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-400 block text-[10px] uppercase">Email Address</span>
                      <span className="font-medium underline break-all">{selectedCustomer.email}</span>
                    </div>
                  </a>

                  <a 
                    href={`tel:${selectedCustomer.phone}`} 
                    className="flex items-start gap-3 text-xs text-gray-600 hover:text-blue-600 group/link"
                  >
                    <Phone size={15} className="text-gray-400 group-hover/link:text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-400 block text-[10px] uppercase">Phone Number</span>
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                  </a>

                  <div className="flex items-start gap-3 text-xs text-gray-600">
                    <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-400 block text-[10px] uppercase">Delivery Address</span>
                      <span className="font-medium leading-relaxed">
                        {selectedCustomer.address || 'No address specified.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Stats Card */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Purchasing Statistics
                </h4>

                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col divide-y divide-gray-100">
                  <div className="flex justify-between py-2.5 first:pt-0">
                    <span className="text-xs text-gray-500 font-medium">Total Orders:</span>
                    <span className="text-xs font-bold text-gray-800">{selectedCustomer.orders}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs text-gray-500 font-medium">Total Spent:</span>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs text-gray-500 font-medium">Average Order:</span>
                    <span className="text-xs font-bold text-gray-800">
                      {selectedCustomer.orders > 0 
                        ? formatCurrency(selectedCustomer.totalSpent / selectedCustomer.orders) 
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 last:pb-0">
                    <span className="text-xs text-gray-500 font-medium">Last Order Date:</span>
                    <span className="text-xs font-bold text-gray-700">{formatDate(selectedCustomer.lastOrder)}</span>
                  </div>
                </div>
              </div>

            </div>

         
          </div>
        </div>
      )}

      {/* Confirmation Dialog Component */}
      <ConfirmationModal 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default Users;
