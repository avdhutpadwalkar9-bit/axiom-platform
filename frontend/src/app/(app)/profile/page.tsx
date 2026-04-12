"use client";

import { User, Building2, Save, Globe, Calendar } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function ProfilePage() {
  const { personal, business, setPersonal, setBusiness } = useOnboardingStore();

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Profile & Business Details</h1>
      <p className="text-sm text-[#999] mb-8">Manage your personal and business information. Changes here improve AI analysis accuracy.</p>

      {/* Personal */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Personal Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#999] mb-1">Full Name</label>
            <input value={personal.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Phone</label>
            <input value={personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Role</label>
            <input value={personal.role} readOnly className="w-full rounded-lg bg-white border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#444]" />
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Business Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#999] mb-1">Company Name</label>
            <input value={business.companyName} onChange={(e) => setBusiness({ companyName: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Industry</label>
            <input value={business.industry} readOnly className="w-full rounded-lg bg-white border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#444]" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Entity Type</label>
            <input value={business.entityType} readOnly className="w-full rounded-lg bg-white border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#444]" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Year Founded</label>
            <input value={business.yearFounded} onChange={(e) => setBusiness({ yearFounded: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-[#999] mb-1">Services & Products Description</label>
            <textarea value={business.servicesDescription} onChange={(e) => setBusiness({ servicesDescription: e.target.value })} rows={3} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Website</label>
            <input value={business.websiteUrl} onChange={(e) => setBusiness({ websiteUrl: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">Turnover Range</label>
            <input value={business.turnoverRange} readOnly className="w-full rounded-lg bg-white border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#444]" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">GSTIN</label>
            <input value={business.gstin} onChange={(e) => setBusiness({ gstin: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[#999] mb-1">PAN</label>
            <input value={business.pan} onChange={(e) => setBusiness({ pan: e.target.value })} className="w-full rounded-lg bg-[#fafafa] border border-[#e5e5e5] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-emerald-500/50" />
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 bg-white text-[#0a0a0f] font-semibold px-6 py-3 rounded-full hover:bg-[#f5f5f5] transition-all text-sm">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}
