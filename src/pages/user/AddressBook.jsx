import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, X, Home, CheckCircle } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { toast } from '../../components/toast';
import {
  createAddressAPI,
  getMyAddressesAPI,
  updateAddressAPI,
  deleteAddressAPI,
  setDefaultAddressAPI
} from '../../api/addressApi';
import { getAllShippingAPI } from '../../api/shippingApi';

const emptyAddress = {
  fullName: '',
  phoneNumber: '',
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  stateId: '',
  pincode: '',
  isDefault: false,
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [shippingStates, setShippingStates] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load addresses and configured shipping states
  const loadData = async () => {
    setLoading(true);
    try {
      const [addressRes, shippingRes] = await Promise.all([
        getMyAddressesAPI(),
        getAllShippingAPI()
      ]);

      if (addressRes && addressRes.success) {
        setAddresses(addressRes.data);
      } else {
        toast.error(addressRes?.message || 'Failed to load addresses');
      }
      
      if (shippingRes && shippingRes.success) {
        setShippingStates(shippingRes.data);
      } else {
        toast.error(shippingRes?.message || 'Failed to load shipping states');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Address Book details from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddForm = () => {
    setFormData(emptyAddress);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (address) => {
    setFormData({
      fullName: address.fullName || '',
      phoneNumber: address.phoneNumber || '',
      streetAddress: address.streetAddress || '',
      apartment: address.apartment || '',
      city: address.city || '',
      state: address.state || '',
      stateId: address.stateId || '',
      pincode: address.pincode || '',
      isDefault: !!address.isDefault,
    });
    setEditingId(address._id);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (addressToDelete) {
      setLoading(true);
      try {
        const res = await deleteAddressAPI(addressToDelete);
        if (res && res.success) {
          toast.success(res.message || 'Address deleted successfully');
          setAddresses((prev) => prev.filter((addr) => addr._id !== addressToDelete));
          
          // Re-load to update new default address if deleted address was default
          const deletedAddress = addresses.find(addr => addr._id === addressToDelete);
          if (deletedAddress && deletedAddress.isDefault) {
            await loadData();
          }
        } else {
          toast.error(res?.message || 'Failed to delete address');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server error deleting address');
      } finally {
        setAddressToDelete(null);
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStateChange = (e) => {
    const selectedStateId = e.target.value;
    const selectedStateObj = shippingStates.find(s => s._id === selectedStateId);
    setFormData((prev) => ({
      ...prev,
      stateId: selectedStateId,
      state: selectedStateObj ? selectedStateObj.stateName : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.streetAddress || !formData.city || !formData.state || !formData.stateId || !formData.pincode) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const res = await updateAddressAPI(editingId, formData);
        if (res && res.success) {
          toast.success(res.message || 'Address updated successfully');
          setAddresses((prev) =>
            prev.map((addr) => (addr._id === editingId ? res.data : addr))
          );
          setIsFormOpen(false);
        } else {
          toast.error(res?.message || 'Failed to update address');
        }
      } else {
        const res = await createAddressAPI(formData);
        if (res && res.success) {
          toast.success(res.message || 'Address added successfully');
          setAddresses((prev) => [...prev, res.data]);
          setIsFormOpen(false);
        } else {
          toast.error(res?.message || 'Failed to add address');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setLoading(true);
    try {
      const res = await setDefaultAddressAPI(id);
      if (res && res.success) {
        toast.success(res.message || 'Default address updated successfully');
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr._id === id
          }))
        );
      } else {
        toast.error(res?.message || 'Failed to set default address');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error setting default address');
    } finally {
      setLoading(false);
    }
  };

  if (isFormOpen) {
    return (
      <div className="p-8 flex flex-col bg-white flex-1 h-full">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button 
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="streetAddress"
              required
              value={formData.streetAddress}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (optional)</label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                name="stateId"
                required
                value={formData.stateId}
                onChange={handleStateChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="">Select a State</option>
                {shippingStates.length === 0 ? (
                  <option value="" disabled>No shipping states available</option>
                ) : (
                  shippingStates.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.stateName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
              Set as default shipping address
            </label>
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity font-medium shadow-sm disabled:opacity-55"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col bg-white flex-1 h-full">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Address Book</h2>
        <button 
          onClick={handleOpenAddForm}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="flex flex-col gap-6 py-12 items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#002B49] rounded-full animate-spin"></div>
          <span className="text-xs font-semibold uppercase tracking-wider">Loading Address Book...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-lg border border-gray-100 border-dashed">
          <MapPin size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No addresses saved yet.</p>
          <button 
            onClick={handleOpenAddForm}
            className="border border-primary text-primary px-6 py-2 rounded-md hover:bg-primary/5 transition-colors font-medium"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div 
              key={address._id} 
              className="border border-gray-100 rounded-xl p-6 flex flex-col justify-between bg-white shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <Home size={22} className="text-gray-500" strokeWidth={1.5} />
                    <h3 className="font-bold text-lg text-black">{address.fullName}</h3>
                  </div>
                  {address.isDefault && (
                    <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm tracking-wider">
                      DEFAULT
                    </span>
                  )}
                </div>
                
                <div className="text-[15px] text-gray-600 space-y-1.5 mb-6">
                  <p>{address.streetAddress}</p>
                  {address.apartment && <p>{address.apartment}</p>}
                  <p>{address.city}</p>
                  <p>{address.state} {address.pincode}</p>
                  <p>India</p>
                  <p className="pt-2 text-black">
                    <span className="font-bold">PH: </span> {address.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleOpenEditForm(address)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Edit Address"
                >
                  <Edit2 size={16} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setAddressToDelete(address._id)}
                  className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-700 hover:text-white transition-colors"
                  title="Delete Address"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
                <button 
                  onClick={() => !address.isDefault && handleSetDefault(address._id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${address.isDefault ? 'bg-primary/20 text-primary cursor-default' : 'bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary'}`}
                  title={address.isDefault ? "Default Address" : "Set as Default"}
                  disabled={address.isDefault}
                >
                  <CheckCircle size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default AddressBook;
