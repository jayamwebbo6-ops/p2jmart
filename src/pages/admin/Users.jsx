import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { 
  Search, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Users as UsersIcon, 
  ShieldCheck, 
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from '../../components/toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { DeleteBtn, ViewBtn } from '../../components/AdminButtons';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';

// Import backend API services
import { 
  adminGetAllCustomersAPI, 
  adminUpdateCustomerStatusAPI, 
  adminDeleteCustomerAPI 
} from '../../api/userApi'; // Verify path to userApi file

const Users = () => {
  // Dynamic State Management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
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


  const handleEmailClick = (e, email) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = `mailto:${email}`;
};


  // Fetch data from backend on mount
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllCustomersAPI();
      if (res?.success) {
        // Maps backend structural fields safely if named differently (e.g., _id -> id)
        const normalizedData = (res.data || res.users).map(cust => ({
          id: cust.id || cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone || 'N/A',
          orders: cust.orders ?? 0,
          totalSpent: cust.totalSpent ?? 0,
          lastOrder: cust.lastOrder || null,
          status: cust.status || 'Active',
          joinedDate: cust.joinedDate || cust.createdAt,
          address: cust.address || 'No address specified.'
        }));
        setCustomers(normalizedData);
      } else {
        toast.error(res?.message || 'Failed to load client registry.');
      }
    } catch (error) {
      console.error('Error bringing in customer data:', error);
      toast.error('Server error encountered fetching data profile listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const getAvatarBg = (name = 'User') => {
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

  // CRUD Actions pointing to backend
  const handleOpenDetail = (customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleDeleteCustomer = (id, name, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Customer Account',
      `Are you sure you want to permanently delete customer "${name}"? This will erase their contact details and historic statistics. This action is irreversible.`,
      async () => {
        try {
          const res = await adminDeleteCustomerAPI(id);
          if (res?.success) {
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success(`Customer "${name}" deleted successfully.`);
            if (selectedCustomer && selectedCustomer.id === id) {
              setDetailModalOpen(false);
            }
          } else {
            toast.error(res?.message || 'Could not delete user.');
          }
        } catch (error) {
          toast.error('An error occurred while attempting account deletion.');
        }
      }
    );
  };

  const handleUpdateStatusInDetail = async (status) => {
    if (!selectedCustomer) return;
    try {
      const res = await adminUpdateCustomerStatusAPI(selectedCustomer.id, status);
      if (res?.success) {
        const updated = { ...selectedCustomer, status };
        setSelectedCustomer(updated);
        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success(`Customer status updated to ${status}.`);
      } else {
        toast.error(res?.message || 'Failed updating status.');
      }
    } catch (err) {
      toast.error('Network failure updating configuration parameters.');
    }
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
      const matchesSearch = 
        c.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        c.phone?.includes(debouncedSearchQuery) ||
        (c.address && c.address.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'lastOrder') {
        aVal = aVal || '0000-00-00';
        bVal = bVal || '0000-00-00';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculated Metrics
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <UsersIcon size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Clients</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{totalCustomers}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Active Accounts</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Sales</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

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

      {/* Main Content Layout Block handling dynamic status updates */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-gray-200 rounded-xl bg-white shadow-sm gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="text-xs font-semibold text-gray-400">Loading Client Master Lists...</span>
        </div>
      ) : (
        <>
          <AdminTable
            headers={[
              { key: 'name', label: 'Customer' },
              { key: 'email', label: 'Contact Info' },
              { key: 'orders', label: 'Orders', align: 'center' },
              { key: 'totalSpent', label: 'Total Spent', align: 'right' },
              { key: 'lastOrder', label: 'Last Order' },
              { key: 'status', label: 'Status', align: 'center' },
              { key: 'actions', label: 'Actions', align: 'center' }
            ]}
            data={filteredCustomers}
            onSort={handleSort}
            sortConfig={sortConfig}
            containerClassName="border border-gray-200/80 rounded-xl overflow-hidden"
            emptyMessage={
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <UsersIcon size={32} className="text-gray-300" />
                <span className="text-xs font-medium text-gray-400">No matching customers found.</span>
              </div>
            }
            renderRow={(customer) => (
              <tr 
                key={customer.id}
                onClick={() => handleOpenDetail(customer)}
                className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
              >
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
                        Joined {formatDate(customer.joinedDate)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                   
                   <button 
  onClick={(e) => handleEmailClick(e, customer.email)}
  className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
>
  {customer.email}
</button>
                    {customer.phone !== 'N/A' && (
                      <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline">
                        <Phone size={12} className="text-gray-400" />
                        <span>{customer.phone}</span>
                      </a>
                    )}
                  </div>
                </td>

                <td className="py-4 px-6 text-center font-semibold text-gray-800">
                  {customer.orders}
                </td>

                <td className="py-4 px-6 text-right font-bold text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </td>

                <td className="py-4 px-6 text-gray-500 font-medium">
                  {formatDate(customer.lastOrder)}
                </td>

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

          <div className="bg-gray-50/50 border border-gray-250 border-t-0 rounded-b-xl px-6 py-4 flex items-center justify-between text-[11px] font-medium text-gray-500 -mt-[1px] relative z-10">
            <span>Showing {filteredCustomers.length} of {totalCustomers} customers</span>
            {statusFilter !== 'All' && (
              <span>Filtered by status: <strong>{statusFilter}</strong></span>
            )}
          </div>
        </>
      )}

      {/* Customer Detail Sheet Modal */}
      {detailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-gray-150 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
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

            <div className="p-6 border-b border-gray-100/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 ${getAvatarBg(selectedCustomer.name)}`}>
                {getInitials(selectedCustomer.name)}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedCustomer.name}
                  </h3>
                 
                </div>
                <span className="text-xs text-gray-400 block mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar size={12} />
                  Client since {formatDate(selectedCustomer.joinedDate)}
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/20">
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact Information</h4>
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3.5 shadow-sm">
                  <a href={`mailto:${selectedCustomer.email}`} className="flex items-start gap-3 text-xs text-gray-600 hover:text-blue-600 group/link">
                    <Mail size={15} className="text-gray-400 group-hover/link:text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-400 block text-[10px] uppercase">Email Address</span>
                      <span className="font-medium underline break-all">{selectedCustomer.email}</span>
                    </div>
                  </a>

                  {selectedCustomer.phone !== 'N/A' && (
                    <a href={`tel:${selectedCustomer.phone}`} className="flex items-start gap-3 text-xs text-gray-600 hover:text-blue-600 group/link">
                      <Phone size={15} className="text-gray-400 group-hover/link:text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-400 block text-[10px] uppercase">Phone Number</span>
                        <span className="font-medium">{selectedCustomer.phone}</span>
                      </div>
                    </a>
                  )}

                  <div className="flex items-start gap-3 text-xs text-gray-600">
                    <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-400 block text-[10px] uppercase">Delivery Address</span>
                      <span className="font-medium leading-relaxed">{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Purchasing Statistics</h4>
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