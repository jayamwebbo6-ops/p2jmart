import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaExternalLinkAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaCloudUploadAlt } from 'react-icons/fa';

const ContactSocialSettings = ({ formData, setFormData, onSave, isSaving }) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ contactSetting: formData });
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-6 font-sans antialiased text-slate-700">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN PANEL: CONTACT & SHIPPING CONFIG */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <FaPhoneAlt className="text-primary w-4 h-4" />
            <h2 className="text-sm font-black text-[#002B49] uppercase tracking-wider">Contact & Shipping</h2>
          </div>

          {/* TELEPHONE FIELD */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">Display Phone Number</label>
            <input 
              type="text" 
              value={formData.phones || ''}
              onChange={(e) => setFormData({...formData, phones: e.target.value})}
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Separate multiple phone numbers with a comma (,) or slash (/) (e.g. +91 8072477365, 9361142097)</p>
          </div>

          {/* SUPPORT EMAILS */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">Contact / Support Email</label>
            <input 
              type="email" 
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Shown on the Contact page.</p>
          </div>

          {/* PHYSICAL STORE ADDRESS CONTAINER */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">Store / Contact Address</label>
            <textarea 
              rows={3}
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl p-4 text-sm font-semibold text-slate-800 focus:outline-none resize-none leading-relaxed transition-all"
            />
          </div>
        </div>

        {/* RIGHT COLUMN PANEL: SOCIAL INTERFACES INPUTS REGISTRY */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <FaExternalLinkAlt className="text-primary w-4 h-4" />
            <h2 className="text-sm font-black text-[#002B49] uppercase tracking-wider">Social Media Links</h2>
          </div>

          <p className="text-[11px] text-slate-400 font-medium tracking-wide">Leave a field empty to hide its icon from the website header/footer.</p>

          <div className="space-y-4">
            {/* FACEBOOK INTEGRATION ITEM */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FaFacebookF size={14} />
              </div>
              <input 
                type="text" 
                value={formData.facebook || ''}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none transition-all"
              />
            </div>

            {/* TWITTER LINK HOOK */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
                <FaTwitter size={14} />
              </div>
              <input 
                type="text" 
                value={formData.twitter || ''}
                onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none transition-all"
              />
            </div>

            {/* INSTAGRAM LINK ROW ITEM */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                <FaInstagram size={14} />
              </div>
              <input 
                type="text" 
                value={formData.instagram || ''}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none transition-all"
              />
            </div>

            {/* YOUTUBE PATH CONFIGURATION */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <FaYoutube size={14} />
              </div>
              <input 
                type="text" 
                value={formData.youtube || ''}
                onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* DYNAMIC MASTER SAVE SYSTEM TRIGGER BUTTON */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary hover:bg-secondary text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaCloudUploadAlt size={14} />
              <span>{isSaving ? 'Saving...' : 'Save System Config'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ContactSocialSettings;