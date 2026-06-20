import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, ShieldCheck, MapPin } from 'lucide-react';

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
    if (window.confirm("Are you sure you want to delete this shipping configuration rate?")) {
      setShippingRecords(shippingRecords.filter(item => item.id !== id));
    }
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
    <div className="w-full min-h-screen bg-[#f3f4f9] font-['Inter',sans-serif] antialiased p-4 sm:p-6 md:p-8 relative">
      
      {/* HEADER CONTROL WRAPPER BAR */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#5a6a85] tracking-tight">
            Shipping Cost
          </h1>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-[#1e88e5] hover:bg-[#1565c0] text-white px-5 py-2 rounded-lg text-sm font-medium tracking-wide shadow-sm hover:shadow transition-all duration-150 active:scale-98 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add State</span>
        </button>
      </div>

      {/* CORE DATA SHEET HOUSING CONTAINER CARD */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200/60 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#111c43] tracking-tight flex items-center gap-2">
            <MapPin size={18} className="text-gray-400" />
            Shipping Cost Details
          </h2>
        </div>

        {/* DATA REGISTER ROW LOGIC GRID TABLE FRAMEWORK */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white text-[11px] font-bold text-[#5a6a85]/80 uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">Id</th>
                <th className="py-4 px-6">State Name</th>
                <th className="py-4 px-6">Base Weight (G)</th>
                <th className="py-4 px-6">Base Cost ($)</th>
                <th className="py-4 px-6">Additional Weight Unit (G)</th>
                <th className="py-4 px-6">Additional Cost Per Unit ($)</th>
                <th className="py-4 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px] font-medium text-slate-600">
              {shippingRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors duration-100">
                  <td className="py-4 px-6 text-center font-normal text-gray-400">{record.id}</td>
                  <td className="py-4 px-6 text-[#111c43] font-semibold">{record.stateName}</td>
                  <td className="py-4 px-6 font-mono text-gray-500">{record.baseWeight}</td>
                  <td className="py-4 px-6 font-mono text-gray-900">${record.baseCost}</td>
                  <td className="py-4 px-6 font-mono text-gray-500">{record.additionalWeight}</td>
                  <td className="py-4 px-6 font-mono text-gray-900">${record.additionalCost}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col gap-1.5 max-w-[100px] mx-auto">
                      <button
                        type="button"
                        onClick={() => openEditModal(record)}
                        className="w-full bg-[#1e88e5] hover:bg-[#1565c0] text-white text-[11px] font-semibold py-1.5 px-3 rounded shadow-xs transition-colors cursor-pointer text-center"
                      >
                        Edit
                      </button>
                    

                       <button 
                        onClick={() => handleDeleteRow(record.id)}
                                            className="p-2 pl-9.5 w-0 rounded-xl text-red-600 transition-colors"
                                          >
                                            <Trash2 size={14} />
                                          </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE REGISTER BOUNDARY FALLBACK */}
        {shippingRecords.length === 0 && (
          <div className="w-full text-center py-16 text-sm font-medium text-gray-400 bg-slate-50/30">
            No dynamic regional shipping matrix definitions found. Click "Add State" to declare configurations.
          </div>
        )}
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
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-xs transition-colors cursor-pointer active:scale-98"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShippingCostManager;