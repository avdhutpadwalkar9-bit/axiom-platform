/* ════════════════════════════════════════════════════════════════
   Demo-mode utility.

   We maintain TWO classes of accounts:

   1. REAL accounts (e.g. Avdhut's own work email). These should
      ONLY ever display what the user has actually provided
      themselves — name, email, business profile from onboarding,
      uploaded financial data. No fabricated Vadodara Chem
      placeholders on personal pages, no fake teammates, no
      hardcoded "₹45 Cr revenue" on dashboard until they upload.

   2. DEMO accounts (a small allowlist of seed emails). These
      auto-populate the onboarding store and analysis store with
      Vadodara Chem showcase data on login, so prospects can sign
      in and see what a populated workspace looks like end-to-end.
      Modelled on the structure of a real US Quality-of-Earnings
      report (Project Pacers · MARC Glocal / Mammoth Admin & Tech).

   The mechanism: on every authenticated mount of (app)/layout.tsx,
   we check the signed-in user's email. If it's in DEMO_ACCOUNT_EMAILS
   AND the onboarding store doesn't already have demo data, we seed
   it. If the user is NOT a demo account but the store has stale
   demo data from a previous demo session in the same browser, we
   clear it so they don't see someone else's Vadodara Chem data.
   ════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAnalysisStore } from "@/stores/analysisStore";

/* ──────────── public credentials ──────────── */

/** Email-address allowlist for the demo workspace. Add more demo
 *  emails here as we curate more sample workspaces (US SMB, PE
 *  portco, etc.). Case-insensitive on match. */
export const DEMO_ACCOUNT_EMAILS = [
  "demo@cortexcfo.in",
];

/** Showable to a prospect — the one we hand out for live walk-throughs. */
export const DEMO_DISPLAY_EMAIL = "demo@cortexcfo.in";
/** Strong enough not to trip a password-validation rule but easy to
 *  type during a demo. Owner can rotate by re-registering. */
export const DEMO_DISPLAY_PASSWORD = "DemoVadodara2026!";

/** Local-storage flag we use to know whether the onboarding store
 *  currently holds demo data we put there (vs the user's own data).
 *  Lets us clear the demo data cleanly when a real account signs in
 *  on the same browser. */
const DEMO_FLAG_KEY = "cortexcfo:demo-seeded";

/* ──────────── helpers ──────────── */

export function isDemoEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return DEMO_ACCOUNT_EMAILS.includes(email.trim().toLowerCase());
}

/** Hook — returns whether the signed-in user is one of our demo
 *  accounts. SSR-safe (false on the server). */
export function useIsDemoAccount(): boolean {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return false;
  return isDemoEmail(user?.email);
}

/* ──────────── demo data definition ──────────── */

/* Demo workspace = Vadodara Chem Pvt Ltd. Structured to mirror what
   a Project-Pacers-style diligence-grade QoE workbook would surface:
   specialty-chemicals MSME in the ₹10-50 Cr band, customer-
   concentration flag, related-party rent flag, two-step SDE→QoE
   adjustment ladder cleanly populated, etc. */
const DEMO_PERSONAL = {
  fullName: "Vikram Shah",
  phone: "+91 98250 14521",
  role: "Chief Financial Officer",
};

const DEMO_BUSINESS = {
  companyName: "Vadodara Chem Pvt Ltd",
  currency: "INR" as const,
  region: "IN" as const,
  gstin: "24AABCV1234M1ZP",
  pan: "AABCV1234M",
  cin: "U24290GJ2009PTC056842",
  industry: "Specialty Chemicals",
  entityType: "Private Limited",
  servicesDescription:
    "Speciality surfactants and additives for paints, polymers, and personal-care formulators. ~70% domestic / 30% export.",
  websiteUrl: "vadodarachem.com",
  yearFounded: "2009",
  hadPivot: false,
  pivotDescription: "",
  turnoverRange: "₹10–50 Cr",
  employeeCount: "44",
  accountingSoftware: "Tally Prime",
};

const DEMO_UPLOAD = {
  financialYears: ["FY 2024-25", "FY 2023-24", "FY 2022-23"],
  uploadType: "trial_balance",
  isDemoMode: true,
};

/* ──────────── seeder / cleaner ──────────── */

/** Idempotently seed the onboarding store with demo Vadodara Chem
 *  data. Marks the seed in localStorage so we can clean it up later
 *  if a real account signs into the same browser. */
export function seedDemoOnboarding(): void {
  if (typeof window === "undefined") return;
  const { setPersonal, setBusiness, setUpload, completeOnboarding } =
    useOnboardingStore.getState();
  setPersonal(DEMO_PERSONAL);
  setBusiness(DEMO_BUSINESS);
  setUpload(DEMO_UPLOAD);
  completeOnboarding();
  try {
    window.localStorage.setItem(DEMO_FLAG_KEY, "1");
  } catch {
    /* quota / disabled — non-fatal */
  }
}

/** If the local store currently holds demo data we previously
 *  seeded, wipe it. Called on real-account sign-in so the user
 *  doesn't see Vadodara Chem from a prior demo session. */
export function clearDemoOnboarding(): void {
  if (typeof window === "undefined") return;
  const flag = window.localStorage.getItem(DEMO_FLAG_KEY);
  if (!flag) return;
  useOnboardingStore.getState().reset();
  useAnalysisStore.getState().clearResult();
  try {
    window.localStorage.removeItem(DEMO_FLAG_KEY);
  } catch {
    /* non-fatal */
  }
}

/** True if the on-disk onboarding store already has Vadodara Chem
 *  data we previously seeded. Used to avoid re-seeding on every
 *  refresh (which would clobber any edits the demo user made). */
export function isDemoAlreadySeeded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(DEMO_FLAG_KEY);
  } catch {
    return false;
  }
}
