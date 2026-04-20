"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Save, AlertTriangle, Loader2, X } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";

// The exact literal the backend requires. Kept in sync manually with
// DELETE_ACCOUNT_CONFIRMATION in backend/app/routers/auth.py.
const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

// Shared field/input class strings. Pulled out so the whole form stays
// visually consistent and future token tweaks are one-file changes.
// Tokens are defined in app/globals.css (`--color-app-*`).
const LABEL_CLS = "block text-xs text-app-text-muted mb-1";
const INPUT_CLS =
  "w-full rounded-lg bg-app-canvas border border-app-border px-3 py-2.5 text-sm text-app-text outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition-colors";
const INPUT_READONLY_CLS =
  "w-full rounded-lg bg-app-canvas border border-app-border px-3 py-2.5 text-sm text-app-text-muted cursor-not-allowed";

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
      <h1 className="text-2xl font-bold text-app-text mb-1">Profile & Business Details</h1>
      <p className="text-sm text-app-text-muted mb-8">Manage your personal and business information. Changes here improve AI analysis accuracy.</p>

      {/* Personal */}
      <div className="bg-app-card rounded-xl border border-app-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-app-text">Personal Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>Full Name</label>
            <input value={personal.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Phone</label>
            <input value={personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Role</label>
            <input value={personal.role} readOnly className={INPUT_READONLY_CLS} />
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="bg-app-card rounded-xl border border-app-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-app-text">Business Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            {/* Region toggle — drives currency symbol, AI voice, FAQ
                filtering, and which compliance framework CortexCFO
                speaks. Isolated at the top of the business card so
                it's obvious it's a GLOBAL knob, not per-section. */}
            <label className={LABEL_CLS}>Region &amp; currency</label>
            <div className="flex items-center gap-2">
              <RegionButton
                active={business.region === "US"}
                label="United States"
                sub="USD · US GAAP"
                onClick={() => setBusiness({ region: "US" })}
              />
              <RegionButton
                active={business.region === "IN"}
                label="India"
                sub="INR · Ind AS"
                onClick={() => setBusiness({ region: "IN" })}
              />
            </div>
            <p className="text-[10px] text-app-text-subtle mt-1.5">
              Changes currency formatting across every page, the AI
              advisor voice, and which regulatory framework (GAAP vs
              Ind AS) we reference.
            </p>
          </div>
          <div>
            <label className={LABEL_CLS}>Company Name</label>
            <input value={business.companyName} onChange={(e) => setBusiness({ companyName: e.target.value })} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Industry</label>
            <input value={business.industry} readOnly className={INPUT_READONLY_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Entity Type</label>
            <input value={business.entityType} readOnly className={INPUT_READONLY_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Year Founded</label>
            <input value={business.yearFounded} onChange={(e) => setBusiness({ yearFounded: e.target.value })} className={INPUT_CLS} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Services & Products Description</label>
            <textarea value={business.servicesDescription} onChange={(e) => setBusiness({ servicesDescription: e.target.value })} rows={3} className={`${INPUT_CLS} resize-none`} />
          </div>
          <div>
            <label className={LABEL_CLS}>Website</label>
            <input value={business.websiteUrl} onChange={(e) => setBusiness({ websiteUrl: e.target.value })} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Turnover Range</label>
            <input value={business.turnoverRange} readOnly className={INPUT_READONLY_CLS} />
          </div>
          {business.region === "IN" && (
            <>
              <div>
                <label className={LABEL_CLS}>GSTIN</label>
                <input value={business.gstin} onChange={(e) => setBusiness({ gstin: e.target.value })} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>PAN</label>
                <input value={business.pan} onChange={(e) => setBusiness({ pan: e.target.value })} className={INPUT_CLS} />
              </div>
            </>
          )}
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
      <div className="mt-12 bg-app-card rounded-xl border border-red-500/25 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-xs text-app-text-subtle mb-5 leading-relaxed">
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
          className="flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-medium px-4 py-2 rounded-lg transition-colors text-[13px]"
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
            className="w-full max-w-md rounded-2xl bg-app-elevated border border-red-500/40 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-app-text">Delete account</h3>
              </div>
              <button
                onClick={() => !deleteLoading && setDeleteOpen(false)}
                disabled={deleteLoading}
                className="text-app-text-subtle hover:text-app-text-muted disabled:opacity-30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-app-text-muted mb-5 leading-relaxed">
              This wipes your user record, business profile, all workspaces you
              own, every financial model, scenario and analysis result. It
              cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] text-app-text-subtle mb-1.5 font-medium">
                Confirm your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
                placeholder="Current password"
                className="w-full rounded-lg bg-app-canvas border border-app-border px-3 py-2.5 text-sm text-app-text outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15 disabled:opacity-60 transition-colors"
                autoComplete="current-password"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] text-app-text-subtle mb-1.5 font-medium">
                Type <span className="text-red-400 font-mono">{DELETE_CONFIRMATION_TEXT}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={deleteLoading}
                placeholder={DELETE_CONFIRMATION_TEXT}
                className="w-full rounded-lg bg-app-canvas border border-app-border px-3 py-2.5 text-sm text-app-text font-mono outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15 disabled:opacity-60 transition-colors"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {deleteError && (
              <p className="mb-4 text-[12px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="text-[13px] text-app-text-muted hover:text-app-text px-4 py-2 disabled:opacity-40 transition-colors"
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

// Region toggle pill — used in the Business Information card. Kept as a
// small helper so each region option is pixel-identical.
function RegionButton({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-start gap-0.5 px-3.5 py-2.5 rounded-lg border text-left transition-all ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-app-text"
          : "border-app-border bg-app-card-hover text-app-text-muted hover:text-app-text hover:border-app-border-strong"
      }`}
    >
      <span className="text-[13px] font-medium">{label}</span>
      <span className={`text-[10px] ${active ? "text-emerald-400/80" : "text-app-text-subtle"}`}>{sub}</span>
    </button>
  );
}
