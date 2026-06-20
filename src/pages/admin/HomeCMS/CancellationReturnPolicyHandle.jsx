import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const INITIAL_POLICIES = [
  {
    id: 1,
    title: "1. Return Conditions",
    points: [
      "Eligibility: We accept returns within 30 days of delivery for standard items.",
      "Condition: The item must be unused, in its original packaging, and in the same condition as when you received it.",
      "Customized Products: Products with custom embroidery, printing, or designs cannot be returned unless there is a manufacturing defect or printing error on our part.",
      "Proof of Purchase: A receipt, order confirmation email, or invoice is required to process any return request."
    ]
  },
  {
    id: 2,
    title: "2. Cancellation Terms",
    points: [
      "Standard orders can be cancelled within 24 hours of purchase for a full refund.",
      "Customized or personalized print production batches cannot be cancelled once manufacturing or embroidery setups have begun.",
      "To cancel an order, contact user support immediately with your order reference ID number."
    ]
  },
  {
    id: 3,
    title: "3. Refund Execution Methods",
    points: [
      "Once your return package is inspected and approved, a refund will be initialized automatically.",
      "Refund transactions are issued back to the original method of payment (bank gateway, credit card, etc.).",
      "Please allow 5 to 7 business days for the credit adjustments to reflect on your statement."
    ]
  }
];

const CancellationReturnPolicyHandle = () => {
  const [sections, setSections] = useState(INITIAL_POLICIES);

  // 1. Core Section Action Handlers
  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      points: ['']
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleUpdateTitle = (sectionId, value) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title: value } : s
    ));
  };

  // 2. Policy Points Nested Row Actions Handlers
  const handleAddPoint = (sectionId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, points: [...s.points, ''] } : s
    ));
  };

  const handleUpdatePoint = (sectionId, pointIndex, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newPoints = [...s.points];
        newPoints[pointIndex] = value;
        return { ...s, points: newPoints };
      }
      return s;
    }));
  };

  const handleRemovePoint = (sectionId, pointIndex) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        // Prevent removal if it is the only point row left
        if (s.points.length <= 1) return s; 
        return { ...s, points: s.points.filter((_, idx) => idx !== pointIndex) };
      }
      return s;
    }));
  };

  const handleSaveAllPolicies = () => {
    console.log("Saving return & cancellation policy payload: ", sections);
    alert("Return & Cancellation Policy updated locally!");
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full p-6 md:p-10 font-sans text-slate-700 antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP HEADER CONTROLS BAR BAR */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002B49]">
            Return & Cancellation Policy Blocks ({sections.length})
          </h1>
          <button
            type="button"
            onClick={handleAddSection}
            className="bg-primary hover:bg-secondary text-white border px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add New Section</span>
          </button>
        </div>

        {/* CONTAINER LOOP FOR POLICIES SECTIONS */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div 
              key={section.id} 
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 relative group space-y-6"
            >
              {/* REMOVE SECTION ACTION BUTTON (Top Corner Placement) */}
              <button
                type="button"
                onClick={() => handleRemoveSection(section.id)}
                className="absolute top-6 right-6 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Remove complete policy block"
              >
                <Trash2 size={18} strokeWidth={2} />
              </button>

              {/* SECTION INPUT FRAME HEADER */}
              <div className="space-y-2 max-w-xl">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  Section Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1. Return Conditions, 2. Cancellation Terms"
                  value={section.title}
                  onChange={(e) => handleUpdateTitle(section.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 text-sm font-bold text-[#002B49] focus:outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>

              {/* NESTED LIST POINTS WORKSPACE ENGINE */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  Policy Points
                </label>
                
                <div className="space-y-3">
                  {section.points.map((point, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {/* Numeric Index Badge Pill Layout */}
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] text-slate-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Content Input Core Textbox Field */}
                      <input
                        type="text"
                        placeholder="Enter return requirement condition text content..."
                        value={point}
                        onChange={(e) => handleUpdatePoint(section.id, index, e.target.value)}
                        className="w-full bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-300 focus:outline-none shadow-xs transition-all"
                      />

                      {/* Item Node Drop Delete Action Trigger */}
                      <button
                        type="button"
                        disabled={section.points.length <= 1}
                        onClick={() => handleRemovePoint(section.id, index)}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors flex-shrink-0 cursor-pointer"
                        title="Delete this point row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ADD SUBPOINT TRIGGER FOOTER ACTION PANEL */}
                <div className="pt-2 pl-10">
                  <button
                    type="button"
                    onClick={() => handleAddPoint(section.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={3} />
                    <span>Add another condition point</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium text-xs">
            No return procedures configured yet. Click "Add New Section" to insert modules.
          </div>
        )}

        {/* REPLICATED SYSTEM SAVE CONTROL BAR FOOTER */}
        {sections.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveAllPolicies}
              className="bg-[#00213d] hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Save Return & Cancellation Policy
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CancellationReturnPolicyHandle;