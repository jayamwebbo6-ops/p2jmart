import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDanger = true,
  showReasonInput = false // New prop to enable the cancellation reason input
}) => {
  const [reason, setReason] = useState('');

  // Reset input field when modal opens/closes
  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showReasonInput && !reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    onConfirm(showReasonInput ? reason.trim() : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <AlertCircle size={20} />
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {message}
              </p>

              {showReasonInput && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please tell us why you want to cancel this order..."
                    required
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
                isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:opacity-90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationModal;