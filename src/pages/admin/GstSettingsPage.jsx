import React, { useState } from 'react';
// Change FaTrash2 to FaTrash
import { FaPercent, FaPlus, FaTrash, FaEdit, FaEye, FaSave, FaUndo, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { toast } from '../../components/toast'; // Uses your local toast system setup
import ConfirmationModal from "../../components/ConfirmationModal";

const INITIAL_GST_DATA = [
  { id: 1, gstStatus: 'Yes', gstPercentage: 2, categoryName: 'Furniture' },
  { id: 2, gstStatus: 'Yes', gstPercentage: 12, categoryName: 'Toys and Games' },
  { id: 3, gstStatus: 'Yes', gstPercentage: 2, categoryName: 'Pet Supplies' },
  { id: 4, gstStatus: 'Yes', gstPercentage: 5, categoryName: 'sports and Fitness' },
  { id: 7, gstStatus: 'Yes', gstPercentage: 5, categoryName: 'Furniture' }
];

const AVAILABLE_CATEGORIES = [
  'Furniture', 'Toys and Games', 'Pet Supplies', 'sports and Fitness', 
  'Electronics', 'Apparel', 'Beauty Kits', 'Stationary'
];

const GSTSettingsPage = () => {
  const [gstRules, setGstRules] = useState(INITIAL_GST_DATA);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Configuration Form State Matrix (Matches image_be2292.png)
  const [formData, setFormData] = useState({
    id: null,
    gstStatus: 'Yes',
    categoryName: '',
    gstPercentage: ''
  });

  // Modal State Controllers
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Initialize a fresh new rule block
  const handleCreateNewRule = () => {
    setSelectedRule('new');
    setIsEditing(true);
    setFormData({
      id: null,
      gstStatus: 'Yes',
      categoryName: '',
      gstPercentage: ''
    });
  };

  // Select item row for viewing or editing
  const handleSelectRule = (rule, editMode = false) => {
    setSelectedRule(rule);
    setIsEditing(editMode);
    setFormData({
      id: rule.id,
      gstStatus: rule.gstStatus,
      categoryName: rule.categoryName,
      gstPercentage: rule.gstPercentage
    });
  };

  // Submit and save action engine
  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!formData.categoryName) {
      toast.error ? toast.error("Please select a target Category Name") : alert("Please select a Category Name");
      return;
    }
    if (formData.gstPercentage === '' || isNaN(formData.gstPercentage)) {
      toast.error ? toast.error("Please enter a valid GST percentage numerical number") : alert("Invalid GST percentage");
      return;
    }

    if (selectedRule === 'new') {
      // Add operational sequence block
      const newId = gstRules.length > 0 ? Math.max(...gstRules.map(r => r.id)) + 1 : 1;
      const newRule = {
        id: newId,
        gstStatus: formData.gstStatus,
        gstPercentage: Number(formData.gstPercentage),
        categoryName: formData.categoryName
      };
      setGstRules([...gstRules, newRule]);
      toast.success ? toast.success("GST Rule generated successfully") : console.log("Saved");
    } else {
      // Edit update sequence block
      setGstRules(gstRules.map(rule => rule.id === formData.id ? {
        ...rule,
        gstStatus: formData.gstStatus,
        gstPercentage: Number(formData.gstPercentage),
        categoryName: formData.categoryName
      } : rule));
      toast.success ? toast.success("GST Settings updated successfully") : console.log("Updated");
    }

    // Reset clean fields view state setup
    setIsEditing(false);
    setSelectedRule(null);
  };

  // Trigger modal setup view layer
  const triggerDeletePrompt = (id) => {
    setTargetDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAction = () => {
    setGstRules(gstRules.filter(item => item.id !== targetDeleteId));
    setDeleteModalOpen(false);
    if (selectedRule && selectedRule.id === targetDeleteId) {
      setSelectedRule(null);
      setIsEditing(false);
    }
    toast.success ? toast.success("GST Configuration Rule dropped successfully") : console.log("Deleted");
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-4 md:p-8 font-sans antialiased text-slate-800">
      
      {/* HEADER ACTION CONTROL PANEL BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#002B49] flex items-center gap-2 tracking-tight uppercase">
            <FaPercent className="text-blue-600 w-5 h-5" /> GST Settings Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage global tax categories, configuration states, and standard threshold rules percentages maps dynamically.</p>
        </div>
        <button
          onClick={handleCreateNewRule}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <FaPlus size={12} /> Add New GST Rule
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* CORE MASTER TABLE WORKSPACE GRID (Matches image_be22ca.png Layout exactly) */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Active GST Categories Metrics Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/60 text-[11px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-100">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-6">GST Status</th>
                  <th className="py-4 px-6">GST Percentage</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                {gstRules.map((rule) => (
                  <tr 
                    key={rule.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${selectedRule?.id === rule.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-4 px-6 font-bold text-slate-400 text-center">{rule.id}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${rule.gstStatus === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {rule.gstStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-blue-600 text-base">{rule.gstPercentage}%</td>
                    <td className="py-4 px-6 font-bold text-slate-700 capitalize">{rule.categoryName}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSelectRule(rule, false)}
                          title="View configuration detail"
                          className="flex items-center gap-1 bg-[#1e88e5] text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs hover:bg-[#1565c0] transition-colors"
                        >
                          <FaEye size={11} /> View
                        </button>
                        <button
                          onClick={() => handleSelectRule(rule, true)}
                          title="Modify configuration params"
                          className="flex items-center gap-1 bg-[#29b6f6] text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs hover:bg-[#0288d1] transition-colors"
                        >
                          <FaEdit size={11} /> Edit
                        </button>
                       <button
  onClick={() => triggerDeletePrompt(rule.id)}
  title="Drop rule structure permanently"
  className="flex items-center gap-1 bg-[#ff4d2d] text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs hover:bg-[#e03a1e] transition-colors"
>
  <FaTrash size={11} /> Delete
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gstRules.length === 0 && (
            <div className="text-center py-12 text-xs font-bold italic text-slate-400 bg-slate-50">
              No configuration rules recorded in the system.
            </div>
          )}
        </div>

        {/* DETAILS/EDITING CONFIGURATION COMPONENT VIEW (Matches image_be2292.png layout fields exactly) */}
        <div className="xl:col-span-1">
          {selectedRule ? (
            <form onSubmit={handleSaveChanges} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden space-y-6 p-6">
              
              {/* Header Action Blocks Row element layout context panels wrapper */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#002B49]">
                    {selectedRule === 'new' ? 'GST Row #New Record' : `GST Row #${formData.id}`}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {isEditing ? 'Configuration Editor Form Block Active' : 'Read-Only Blueprint View Inspector'}
                  </p>
                </div>
                {isEditing ? (
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-[#1e88e5] text-white px-4 py-1.5 rounded-lg font-black text-xs shadow-xs hover:bg-[#1565c0] transition-colors"
                  >
                    <FaSave size={12} /> Save Changes
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 bg-[#29b6f6] text-white px-4 py-1.5 rounded-lg font-black text-xs shadow-xs hover:bg-[#0288d1] transition-colors"
                  >
                    <FaEdit size={12} /> Unlock Field Edit
                  </button>
                )}
              </div>

              {/* ENABLE GST RADIO CONTROL BLOCKS ROW (Image Reference Item Match) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Enable GST Status</label>
                <div className="flex items-center gap-6 pt-1">
                  <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${!isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                    <input 
                      type="radio" 
                      name="gstStatus" 
                      value="Yes"
                      checked={formData.gstStatus === 'Yes'}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, gstStatus: e.target.value})}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${!isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                    <input 
                      type="radio" 
                      name="gstStatus" 
                      value="No"
                      checked={formData.gstStatus === 'No'}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, gstStatus: e.target.value})}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* CATEGORY SELECT DROPDOWN ELEMENT ROW */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Category Name</label>
                <div className="relative">
                  <select
                    value={formData.categoryName}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 appearance-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="" disabled hidden>Select Category</option>
                    {AVAILABLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* PERCENTAGE NUMERICAL INPUT BLOCK FIELD BOX */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">GST In Percentage (%)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter GST percentage"
                    value={formData.gstPercentage}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, gstPercentage: e.target.value})}
                    className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                  />
                  {formData.gstPercentage !== '' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">%</span>
                  )}
                </div>
              </div>

              {/* Operational Cancellation Footer Panel Row */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedRule(null); setIsEditing(false); }}
                  className="w-full text-[11px] font-black tracking-wider uppercase bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 py-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <FaTimes size={10} /> Exit Panel View
                </button>
              </div>

            </form>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400 space-y-2">
              <FaPercent size={24} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold leading-relaxed">No dynamic rule context selected.<br />Click standard inspect buttons on your data rows to begin tuning configurations inline blocks models.</p>
            </div>
          )}
        </div>

      </div>

      {/* RENDER DYNAMIC CONFIRMATION POPUP MODAL HOOK */}
      {deleteModalOpen && (
        <ConfirmationModal 
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDeleteAction}
          title="Delete GST Category Association Map"
          message={`Are you completely sure you want to drop dynamic configuration registry item rule #${targetDeleteId}? This operation is atomic and irreversible.`}
        />
      )}

    </div>
  );
};

export default GSTSettingsPage;