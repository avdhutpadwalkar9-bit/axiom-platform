"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Save, Globe, Calendar, AlertTriangle, Loader2, X } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";

// The exact literal the backend requires. Kept in sync manually with
// DELETE_ACCOUNT_CONFIRMATION in backend/app/routers/auth.py.
const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

export default function ProfilePage() {
  const router = useRouter();
  const { personal, business, setPersonal, setBusiness } = useOnboardingStore();

  // Delete-account modal state. Kept local — no need to touch a store
  // for transient UI state that vanishes on close.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await api.deleteAccount(deletePassword, deleteConfirm);
      // Wipe every client-side trace so a later visitor on the same
      // browser can't see stale data. Covers auth tokens plus the two
      // persisted Zustand stores (cortexcfo-onboarding, cortexcfo-analysis).
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("cortexcfo-onboarding");
        localStorage.removeItem("cortexcfo-analysis");
      }
      router.replace("/login");
    } catch (e) {
      // api.ts throws Error(text) where text is the JSON body from the
      // server. Try to pull the `detail` field out; otherwise surface raw.
      let message = "Could not delete account. Please try again.";
      try {
        const parsed = JSON.parse((e as Error).message);
        if (parsed?.detail) message = parsed.detail;
      } catch { /* non-JSON — keep default */ }
      setDeleteError(message);
      setDeleteLoading(false);
    }
  }

  const canConfirmDelete =
    deletePassword.length > 0 && deleteConfirm === DELETE_CONFIRMATION_TEXT;

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

      {/* Danger Zone — destructive actions isolated below the save button
          so they can't be confused with normal edits. Visually red to
          signal irreversibility. */}
      <div className="mt-12 bg-[#111] rounded-xl border border-red-500/20 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-xs text-white/40 mb-5 leading-relaxed">
          Permanently delete your account and every piece of data tied to it —
          profile details, uploaded financials, analysis history, workspaces,
          scenarios and models. This cannot be undone.
        </p>
        <button
          onClick={() => {
            setDeleteError(null);
            setDeletePassword("");
            setDeleteConfirm("");
            setDeleteOpen(true);
          }}
          className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-medium px-4 py-2 rounded-lg transition-colors text-[13px]"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Delete account and all data
        </button>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !deleteLoading && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#111] border border-red-500/30 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Delete account</h3>
              </div>
              <button
                onClick={() => !deleteLoading && setDeleteOpen(false)}
                disabled={deleteLoading}
                className="text-white/30 hover:text-white/60 disabled:opacity-30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-white/60 mb-5 leading-relaxed">
              This wipes your user record, business profile, all workspaces you
              own, every financial model, scenario and analysis result. It
              cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] text-white/40 mb-1.5 font-medium">
                Confirm your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
                placeholder="Current password"
                className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50 disabled:opacity-60"
                autoComplete="current-password"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] text-white/40 mb-1.5 font-medium">
                Type <span className="text-red-400 font-mono">{DELETE_CONFIRMATION_TEXT}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={deleteLoading}
                placeholder={DELETE_CONFIRMATION_TEXT}
                className="w-full rounded-lg bg-white/3 border border-white/8 px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-red-500/50 disabled:opacity-60"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {deleteError && (
              <p className="mb-4 text-[12px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="text-[13px] text-white/60 hover:text-white/80 px-4 py-2 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!canConfirmDelete || deleteLoading}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-[13px] font-medium px-4 py-2 rounded-lg disabled:opacity-40 disabled:hover:bg-red-500 transition-colors"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>Delete account permanently</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
