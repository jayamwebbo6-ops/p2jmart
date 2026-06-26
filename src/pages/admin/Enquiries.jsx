import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Search, Calendar, Phone, User, Clock, CheckCircle } from 'lucide-react';
import { toast } from '../../components/toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { DeleteBtn } from '../../components/AdminButtons';
import PageHeader from '../../components/PageHeader';
import { getEnqueriesAPI, updateEnqueriesAPI, deleteEnqueriesAPI } from '../../api/enqueriesApi';

const STATIC_ENQUIRIES = [
  {
    id: 'enq-static-1',
    name: 'Zubair Ahmed',
    email: 'zubair.ahmed@example.com',
    phone: '+91 9840123456',
    subject: 'Custom Product Inquiry',
    message: 'I would like to order a customized acrylic nameplate with a floral design. Do you support custom font styles or logos? Let me know the dimensions supported and the expected delivery date for Chennai.',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'enq-static-2',
    name: 'Meera Krishnan',
    email: 'meera.k@example.com',
    phone: '+91 9789012345',
    subject: 'Order Delay Support',
    message: 'Hello, my order #P2J-8842 has not been shipped yet. Could you please provide an update on the tracking details? I need it before next Friday for a housewarming function.',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'enq-static-3',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0199',
    subject: 'Bulk Discount Query',
    message: 'We are looking to order 50 units of the customized wooden sign board for a corporate event. Do you offer bulk pricing discounts and express shipping to our branch?',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  }
];

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_enquiries');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [activeEnquiryId, setActiveEnquiryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await getEnqueriesAPI();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setEnquiries(mapped);
        localStorage.setItem('p2j_mart_enquiries', JSON.stringify(mapped));
        window.dispatchEvent(new Event('enquiriesUpdated'));
      }
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      toast.error("Failed to load enquiries from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const activeEnquiry = enquiries.find(e => e.id === activeEnquiryId) || null;

  // Set first item as active on load if none selected
  useEffect(() => {
    if (enquiries.length > 0 && !activeEnquiryId) {
      setActiveEnquiryId(enquiries[0].id);
    }
  }, [enquiries, activeEnquiryId]);

  // Mark active enquiry as read
  useEffect(() => {
    const target = enquiries.find(e => e.id === activeEnquiryId);
    if (target && !target.read) {
      const markAsRead = async () => {
        try {
          await updateEnqueriesAPI(activeEnquiryId, { read: true });
          setEnquiries(prev => {
            const updated = prev.map(e => 
              e.id === activeEnquiryId ? { ...e, read: true } : e
            );
            localStorage.setItem('p2j_mart_enquiries', JSON.stringify(updated));
            window.dispatchEvent(new Event('enquiriesUpdated'));
            return updated;
          });
        } catch (err) {
          console.error("Error marking enquiry as read:", err);
        }
      };
      markAsRead();
    }
  }, [activeEnquiryId]);

  // Filtered list
  const filteredEnquiries = enquiries.filter(e => 
    (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteEnquiry = (id, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Enquiry',
      'Are you sure you want to permanently delete this enquiry? This action cannot be undone.',
      async () => {
        try {
          await deleteEnqueriesAPI(id);
          const updated = enquiries.filter(item => item.id !== id);
          setEnquiries(updated);
          localStorage.setItem('p2j_mart_enquiries', JSON.stringify(updated));
          window.dispatchEvent(new Event('enquiriesUpdated'));
          toast.success('Enquiry deleted');
          if (activeEnquiryId === id) {
            setActiveEnquiryId(updated[0]?.id || '');
          }
        } catch (err) {
          console.error("Error deleting enquiry:", err);
          toast.error("Failed to delete enquiry");
        }
      }
    );
  };

  const handleToggleReadStatus = async (id, e) => {
    e.stopPropagation();
    const target = enquiries.find(item => item.id === id);
    if (!target) return;
    
    try {
      const newReadStatus = !target.read;
      await updateEnqueriesAPI(id, { read: newReadStatus });
      const updated = enquiries.map(item => 
        item.id === id ? { ...item, read: newReadStatus } : item
      );
      setEnquiries(updated);
      localStorage.setItem('p2j_mart_enquiries', JSON.stringify(updated));
      window.dispatchEvent(new Event('enquiriesUpdated'));
      toast.success(newReadStatus ? 'Marked as read' : 'Marked as unread');
    } catch (err) {
      console.error("Error updating read status:", err);
      toast.error("Failed to update status");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      <PageHeader
        title="Customer Enquiries"
        subtitle="Read and manage contact form requests sent by visitors."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Inbox List */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-55/30">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-grow overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {loading ? (
              <div className="text-center py-20 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-gray-205 border-t-primary rounded-full animate-spin"></div>
                <span>Loading enquiries...</span>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center py-20 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <Mail size={32} className="text-gray-300" />
                <span>No enquiries found.</span>
              </div>
            ) : (
              filteredEnquiries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveEnquiryId(item.id)}
                  className={`p-4 cursor-pointer transition-all flex flex-col gap-1 relative ${
                    activeEnquiryId === item.id 
                      ? 'bg-blue-50/50 border-l-4 border-[#001E3C]' 
                      : 'hover:bg-gray-50/75 border-l-4 border-transparent'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!item.read && (
                    <span className="absolute right-4 top-4 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-sm" />
                  )}

                  <div className="flex justify-between items-start pr-4">
                    <span className={`text-xs ${!item.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <span className={`text-xs truncate ${!item.read ? 'font-bold text-slate-900' : 'text-slate-650'}`}>
                    {item.subject}
                  </span>

                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                    {item.message}
                  </p>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={(e) => handleToggleReadStatus(item.id, e)}
                      className="p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-blue-600 transition-colors"
                      title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {item.read ? <Mail size={13} /> : <MailOpen size={13} />}
                    </button>
                    <DeleteBtn size={13} onClick={(e) => handleDeleteEnquiry(item.id, e)} title="Delete Message" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Message Details */}
        <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          {activeEnquiry ? (
            <div className="flex flex-col h-full">
              {/* Message Header Info */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider block">
                      {activeEnquiry.subject}
                    </h2>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Received: {formatDate(activeEnquiry.createdAt)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleToggleReadStatus(activeEnquiry.id, e)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                    >
                      {activeEnquiry.read ? (
                        <><MailOpen size={12} /> Mark Unread</>
                      ) : (
                        <><CheckCircle size={12} /> Mark Read</>
                      )}
                    </button>
                    <DeleteBtn size={12} onClick={(e) => handleDeleteEnquiry(activeEnquiry.id, e)} title="Delete Enquiry" />
                  </div>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100/60 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={13} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-700">From:</span> {activeEnquiry.name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-700">Email:</span> 
                    <a href={`mailto:${activeEnquiry.email}`} className="text-blue-600 hover:underline">
                      {activeEnquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-700">Phone:</span> {activeEnquiry.phone}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Message Content:
                </span>
                <p className="text-xs text-gray-700 leading-6 whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  {activeEnquiry.message}
                </p>
              </div>

              {/* Action reply footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <a
                  href={`mailto:${activeEnquiry.email}?subject=Re: ${activeEnquiry.subject}`}
                  className="bg-[#001E3C] hover:bg-[#003147] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <Mail size={14} /> Send Email Reply
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow text-xs text-gray-400 gap-2">
              <MailOpen size={36} className="text-gray-300" />
              <span>Select an enquiry from the left to read details.</span>
            </div>
          )}
        </div>
      </div>
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

export default Enquiries;
