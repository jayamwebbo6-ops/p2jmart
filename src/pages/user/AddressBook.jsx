import React, { useState } from 'react';
import { initialAddresses } from '../../utils/mockAddresses';
import { Plus, Edit2, Trash2, MapPin, X, Home, CheckCircle } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const emptyAddress = {
  fullName: '',
  phoneNumber: '',
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const handleOpenAddForm = () => {
    setFormData(emptyAddress);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressToDelete));
      setAddressToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === editingId ? { ...formData, id: editingId } : addr))
      );
    } else {
      const newAddress = {
        ...formData,
        id: Date.now().toString(),
      };
      setAddresses((prev) => [...prev, newAddress]);
    }
    setIsFormOpen(false);
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
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
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
              className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity font-medium shadow-sm"
            >
              Save Address
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

      {addresses.length === 0 ? (
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
              key={address.id} 
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
                >
                  <Edit2 size={16} strokeWidth={2} />
                </button>
               <button
  onClick={() => setAddressToDelete(address.id)}
  className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-700 hover:text-white transition-colors"
>
  <Trash2 size={16} strokeWidth={2} />
</button>
                <button 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${address.isDefault ? 'bg-primary/20 text-primary' : 'bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary'}`}
                  title="Set as Default"
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
