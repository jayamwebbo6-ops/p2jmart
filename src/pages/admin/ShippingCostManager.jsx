import React, { useState } from 'react';
import { X, ShieldCheck, MapPin } from 'lucide-react';
import { AddBtn, EditBtn, DeleteBtn, SaveBtn } from '../../components/AdminButtons';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';
import ConfirmationModal from '../../components/ConfirmationModal';

const INITIAL_SHIPPING_DATA = [
  { id: 1, stateName: 'Tamil Nadu', baseWeight: 250, baseCost: '55.00', additionalWeight: 300, additionalCost: '20.00' },
  { id: 2, stateName: 'Delhi', baseWeight: 500, baseCost: '5.00', additionalWeight: 250, additionalCost: '2.00' },
  { id: 3, stateName: 'Uttar Pradesh', baseWeight: 500, baseCost: '5.00', additionalWeight: 250, additionalCost: '2.00' },
  { id: 4, stateName: 'Kerala', baseWeight: 500, baseCost: '5.00', additionalWeight: 250, additionalCost: '2.00' }
];

const ShippingCostManager = () => {
  const [shippingRecords, setShippingRecords] = useState(INITIAL_SHIPPING_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
  // Modal Form State Management
  const [currentId, setCurrentId] = useState(null);
  const [stateName, setStateName] = useState('');
  const [baseWeight, setBaseWeight] = useState('');
  const [baseCost, setBaseCost] = useState('');
  const [additionalWeight, setAdditionalWeight] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');

  // 1. Open Modal for creating a new record
  const openAddModal = () => {
    setModalMode('add');
    setCurrentId(null);
    setStateName('');
    setBaseWeight('');
    setBaseCost('');
    setAdditionalWeight('');
    setAdditionalCost('');
    setIsModalOpen(true);
  };

  // 2. Open Modal with population for editing an existing record
  const openEditModal = (record) => {
    setModalMode('edit');
    setCurrentId(record.id);
    setStateName(record.stateName);
    setBaseWeight(record.baseWeight);
    setBaseCost(record.baseCost);
    setAdditionalWeight(record.additionalWeight);
    setAdditionalCost(record.additionalCost);
    setIsModalOpen(true);
  };

  // 3. Remove a calculation row rule from the register matrix
  const handleDeleteRow = (id) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const confirmDeleteRow = () => {
    setShippingRecords(shippingRecords.filter(item => item.id !== deleteTargetId));
    setIsConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 4. Handle Save button logic (Covers both create and update validation paths)
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!stateName || !baseWeight || !baseCost || !additionalWeight || !additionalCost) {
      alert("Please populate all numeric configuration matrix blocks.");
      return;
    }

    if (modalMode === 'edit') {
      setShippingRecords(shippingRecords.map(item => 
        item.id === currentId 
          ? { 
              ...item, 
              stateName, 
              baseWeight: Number(baseWeight), 
              baseCost: parseFloat(baseCost).toFixed(2), 
              additionalWeight: Number(additionalWeight), 
              additionalCost: parseFloat(additionalCost).toFixed(2) 
            }
          : item
      ));
    } else {
      const newRecord = {
        id: shippingRecords.length > 0 ? Math.max(...shippingRecords.map(r => r.id)) + 1 : 1,
        stateName,
        baseWeight: Number(baseWeight),
        baseCost: parseFloat(baseCost).toFixed(2),
        additionalWeight: Number(additionalWeight),
        additionalCost: parseFloat(additionalCost).toFixed(2)
      };
      setShippingRecords([...shippingRecords, newRecord]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">

      <PageHeader
        title="Shipping Cost Manager"
        subtitle="Configure regional shipping rates, base weights, and additional cost per unit."
      >
        <AddBtn onClick={openAddModal}>Add State</AddBtn>
      </PageHeader>

      {/* CORE DATA SHEET HOUSING CONTAINER CARD */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200/60 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#111c43] tracking-tight flex items-center gap-2">
            <MapPin size={18} className="text-gray-400" />
            Shipping Cost Details
          </h2>
        </div>

        <AdminTable
          headers={[
            { label: 'Id', align: 'center' },
            { label: 'State Name' },
            { label: 'Base Weight (G)' },
            { label: 'Base Cost ($)' },
            { label: 'Additional Weight Unit (G)' },
            { label: 'Additional Cost Per Unit ($)' },
            { label: 'Actions', align: 'center' }
          ]}
          data={shippingRecords}
          minWidth="min-w-[900px]"
          containerClassName="border-0 shadow-none rounded-none"
          emptyMessage="No dynamic regional shipping matrix definitions found. Click 'Add State' to declare configurations."
          renderRow={(record) => (
            <tr key={record.id} className="hover:bg-slate-50/60 transition-colors duration-100">
              <td className="py-4 px-6 text-center font-normal text-gray-400">{record.id}</td>
              <td className="py-4 px-6 text-[#111c43] font-semibold">{record.stateName}</td>
              <td className="py-4 px-6 font-mono text-gray-500">{record.baseWeight}</td>
              <td className="py-4 px-6 font-mono text-gray-900">${record.baseCost}</td>
              <td className="py-4 px-6 font-mono text-gray-500">{record.additionalWeight}</td>
              <td className="py-4 px-6 font-mono text-gray-900">${record.additionalCost}</td>
              <td className="py-4 px-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <EditBtn size={13} onClick={() => openEditModal(record)} title="Edit record" />
                  <DeleteBtn size={13} onClick={() => handleDeleteRow(record.id)} title="Delete record" />
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* POPUP MODAL CONTROL OVERLAY MECHANISM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[540px] shadow-2xl overflow-hidden border border-gray-100 transform transition-transform duration-200 scale-100">
            
            {/* MODAL HEADER ROW HEADER BANNER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#111c43] tracking-tight">
                {modalMode === 'edit' ? 'Edit State' : 'Add New Shipping State Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* OVERLAY CORE FORM ELEMENT FIELDS */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              
              {/* STATE NAME TEXT FIELD BOX */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  State Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu, Kerala, Delhi"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 placeholder-gray-300 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* BASE WEIGHT FIELD INPUT BOX */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Base Weight (Grams)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={baseWeight}
                  onChange={(e) => setBaseWeight(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 placeholder-gray-300 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* BASE SHIPPING FEE FIELD COST */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Base Shipping Cost (For Base Weight)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 55.00"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 placeholder-gray-300 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* ADDITIONAL STEP ROW INCREMENT WEIGHT CONFIGURATION */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Additional Weight Unit (Grams)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 300"
                  value={additionalWeight}
                  onChange={(e) => setAdditionalWeight(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 placeholder-gray-300 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* UNIT COMPENSATORY PENALTY ADDITIONAL COST */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Additional Cost Per Unit
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 20.00"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 placeholder-gray-300 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* INTERACTION COMMIT FOOTER BUTTON SUBMIT BLOCK */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-start">
                <SaveBtn type="submit">Save</SaveBtn>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDeleteRow}
        title="Delete Shipping Rate"
        message="Are you sure you want to delete this shipping configuration rate?"
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default ShippingCostManager;