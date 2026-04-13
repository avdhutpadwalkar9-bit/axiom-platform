"use client";

import { User, Building2, Save, Globe, Calendar } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function ProfilePage() {
  const { personal, business, setPersonal, setBusiness } = useOnboardingStore();

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <h1 className="text-2xl font-bold text-white mb-1">Profile & Business Details</h1>
      <p className="text-sm text-white/30 mb-8">Manage your personal and business information. Changes here improve AI analysis accuracy.</p>

      {/* Personal */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Personal Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/30 mb-1">Full Name</label>
            <input value={personal.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Phone</label>
            <input value={personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Role</label>
            <input value={personal.role} readOnly className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-2.5 text-sm text-white/60" />
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Business Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/30 mb-1">Company Name</label>
            <input value={business.companyName} onChange={(e) => setBusiness({ companyName: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Industry</label>
            <input value={business.industry} readOnly className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-2.5 text-sm text-white/60" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Entity Type</label>
            <input value={business.entityType} readOnly className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-2.5 text-sm text-white/60" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Year Founded</label>
            <input value={business.yearFounded} onChange={(e) => setBusiness({ yearFounded: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-white/30 mb-1">Services & Products Description</label>
            <textarea value={business.servicesDescription} onChange={(e) => setBusiness({ servicesDescription: e.target.value })} rows={3} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Website</label>
            <input value={business.websiteUrl} onChange={(e) => setBusiness({ websiteUrl: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">Turnover Range</label>
            <input value={business.turnoverRange} readOnly className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-2.5 text-sm text-white/60" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">GSTIN</label>
            <input value={business.gstin} onChange={(e) => setBusiness({ gstin: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">PAN</label>
            <input value={business.pan} onChange={(e) => setBusiness({ pan: e.target.value })} className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          // Changes auto-persist via Zustand localStorage, show confirmation
          const el = document.getElementById("save-confirmation");
          if (el) { el.style.opacity = "1"; setTimeout(() => { el.style.opacity = "0"; }, 2000); }
        }}
        className="flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm"
      >
        <Save className="w-4 h-4" /> Save Changes
      </button>
      <p id="save-confirmation" className="text-xs text-emerald-400 mt-2 transition-opacity duration-300" style={{ opacity: 0 }}>Changes saved successfully.</p>
    </div>
  );
}
