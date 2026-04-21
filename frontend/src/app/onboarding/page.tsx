"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Upload,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  FileSpreadsheet,
  Sparkles,
  Globe,
  Calendar,
  ArrowRight,
  Info,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { asCurrency } from "@/lib/currency";
import { fetchLiveRates, type FxRates } from "@/lib/fx";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STEPS = [
  { id: 0, label: "Personal", icon: User },
  { id: 1, label: "Business", icon: Building2 },
  { id: 2, label: "Financial Data", icon: Upload },
  { id: 3, label: "AI Analysis", icon: Sparkles },
];

const INDUSTRIES = ["Manufacturing", "SaaS", "Services", "Trading", "E-commerce", "Healthcare", "Education", "Real Estate", "Agriculture", "Other"];
const ENTITY_TYPES = ["Proprietorship", "Partnership", "LLP", "Pvt Ltd", "Public Ltd", "One Person Company", "HUF", "Trust"];
const TURNOVER_RANGES = ["Below ₹40 Lakhs", "₹40L - ₹1.5 Crore", "₹1.5Cr - ₹5 Crore", "₹5Cr - ₹25 Crore", "₹25Cr - ₹100 Crore", "Above ₹100 Crore"];
const ROLES = ["Founder / CEO", "CFO / Finance Head", "CA / Accountant", "Investor / PE", "Consultant", "Other"];
const ACCOUNTING_SOFTWARE = ["QuickBooks", "QuickBooks Desktop", "Xero", "QuickBooks", "Busy", "Marg", "Excel / Sheets", "Other"];
const FINANCIAL_YEARS = ["FY 2023-24", "FY 2024-25", "FY 2025-26"];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep, completed, personal, business, upload,
    setStep, setPersonal, setBusiness, setUpload, completeOnboarding,
  } = useOnboardingStore();
  const { setResult: saveAnalysis } = useAnalysisStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("Preparing your analysis…");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // If onboarding was already completed (currentStep persisted as 4 in
  // localStorage), redirect straight to the dashboard instead of showing
  // a blank right panel.
  useEffect(() => {
    if (completed || currentStep > 3) {
      router.replace("/dashboard");
    }
  }, [completed, currentStep, router]);

  const canProceed = () => {
    if (currentStep === 0) return personal.fullName.trim() && personal.role;
    if (currentStep === 1) return business.companyName.trim() && business.industry && business.entityType;
    if (currentStep === 2) return upload.financialYears.length > 0 && (uploadedFile || upload.isDemoMode);
    return true;
  };

  const handleNext = async () => {
    if (currentStep < 2) {
      setStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Start analysis
      setStep(3);
      await runAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  const handleDemoMode = () => {
    setUpload({ isDemoMode: true, financialYears: ["FY 2025-26"] });
    setStep(3);
    runAnalysis(true);
  };

  const runAnalysis = async (demo = false) => {
    setLoading(true);

    // Rotate honest status messages while the real request is in flight.
    // No fake percentage — we show an indeterminate indicator instead.
    const messages = [
      "Reading your financial data…",
      "Classifying accounts by nature…",
      "Checking Ind AS compliance…",
      `Researching ${business.industry || "your"} industry benchmarks…`,
      "Generating strategic insights…",
      "Still working — larger ledgers take a bit longer…",
    ];
    setAnalysisStatus(messages[0]);
    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, messages.length - 1);
      setAnalysisStatus(messages[msgIdx]);
    }, 2500);

    try {
      const token = localStorage.getItem("access_token");

      // Snapshot the FX rate table at upload time. If the fetch fails
      // (offline, frankfurter hiccup) we save with null — consumers
      // fall back to live rates for this analysis. Not blocking.
      const uploadCurrency = asCurrency(business?.currency);
      let snapshotRates: FxRates | null = null;
      try {
        snapshotRates = await fetchLiveRates();
      } catch {
        /* best-effort; live rates take over */
      }

      if (demo) {
        // Load sample TB and analyze
        const sampleEntries = getSampleTB();
        const res = await fetch(`${API_BASE}/api/analysis/tb/json`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ entries: sampleEntries }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json();
        saveAnalysis(data, "Acme Tech Pvt Ltd (Demo)", uploadCurrency, snapshotRates);
      } else if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const res = await fetch(`${API_BASE}/api/analysis/tb/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        saveAnalysis(
          data,
          business.companyName || "Your Company",
          uploadCurrency,
          snapshotRates,
        );
      }

      // Save profile — try POST first, fall back to PUT if already exists
      try {
        const profileBody = JSON.stringify({
          full_name: personal.fullName,
          phone: personal.phone,
          role: personal.role,
          company_name: business.companyName,
          gstin: business.gstin,
          pan: business.pan,
          industry: business.industry,
          entity_type: business.entityType,
          services_description: business.servicesDescription,
          website_url: business.websiteUrl,
          year_founded: business.yearFounded ? parseInt(business.yearFounded) : null,
          had_pivot: business.hadPivot,
          pivot_description: business.pivotDescription,
          turnover_range: business.turnoverRange,
          employee_count: business.employeeCount,
          accounting_software: business.accountingSoftware,
          onboarding_completed: true,
          is_demo_mode: demo,
        });
        const profileRes = await fetch(`${API_BASE}/api/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: profileBody,
        });
        // If profile already exists, update instead
        if (profileRes.status === 400) {
          await fetch(`${API_BASE}/api/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: profileBody,
          });
        }
      } catch (profileErr) {
        // Profile save is non-blocking, but we log it so it's visible in dev tools.
        if (process.env.NODE_ENV !== "production") {
          console.warn("Profile save failed (non-blocking):", profileErr);
        }
      }

      clearInterval(msgTimer);
      setAnalysisStatus("Done");
      completeOnboarding();
      // Post-upload routing: first time a user lands their financials,
      // route them to /pricing (region-aware) so they can pick a plan.
      // Dashboard is one click away from there. Once they've selected
      // a plan (or skipped), subsequent logins land on dashboard via
      // the "already completed" early-return above.
      const region = business.region === "IN" ? "in" : "us";
      router.push(`/pricing?region=${region}&source=onboarding`);
    } catch (err) {
      clearInterval(msgTimer);
      setError(err instanceof Error ? err.message : "Something went wrong while analysing your data. Please try again.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const toggleFY = (fy: string) => {
    const current = upload.financialYears;
    if (current.includes(fy)) {
      setUpload({ financialYears: current.filter((f) => f !== fy) });
    } else {
      setUpload({ financialYears: [...current, fy] });
    }
  };

  const onFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  }, []);

  // Step 3: AI Analysis Loading
  if (currentStep === 3) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-canvas px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-light text-app-text mb-3 tracking-[-0.02em]">
            Analyzing your financials
          </h2>
          <p className="text-sm text-app-text-subtle mb-10">
            Our AI is reviewing your data against Indian accounting standards and generating strategic insights.
          </p>

          {/* Indeterminate progress — honest about unknown duration */}
          <div className="w-full h-1.5 bg-app-canvas rounded-full overflow-hidden mb-4 relative">
            <div className="absolute inset-y-0 w-1/3 bg-emerald-500 rounded-full indeterminate-bar" />
          </div>
          <p className="text-xs text-app-text-subtle" aria-live="polite">{analysisStatus}</p>
          <p className="text-[11px] text-app-text/20 mt-2">Usually 10&ndash;30 seconds, longer for larger ledgers.</p>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-canvas flex">
      {/* Left Panel — Progress */}
      <div className="hidden lg:flex w-80 flex-col border-r border-app-border bg-app-card p-8">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-app-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-lg font-bold text-app-text tracking-[-0.02em]">CortexCFO</span>
        </div>

        <div className="space-y-2 flex-1">
          {STEPS.slice(0, 3).map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive ? "bg-app-canvas border border-app-border" : ""
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDone ? "bg-emerald-500/100/20" : isActive ? "bg-emerald-500/10" : "bg-app-canvas"
                }`}>
                  {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-app-text/15"}`} />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isActive ? "text-app-text" : isDone ? "text-app-text-muted" : "text-app-text/15"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-app-text/15">Step {step.id + 1} of 3</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-app-text/15 mt-auto">
          Your data is encrypted and never shared.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Step 0: Personal Profile */}
          {currentStep === 0 && (
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400/70 mb-3">Step 1 of 3</p>
                <h1 className="text-3xl font-light text-app-text tracking-[-0.02em] mb-2">Tell us about yourself</h1>
                <p className="text-sm text-app-text-subtle">This helps us personalize your experience.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Full Name *</label>
                  <input
                    value={personal.fullName}
                    onChange={(e) => setPersonal({ fullName: e.target.value })}
                    placeholder="e.g., Avdhut Padwalkar"
                    className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Phone Number</label>
                  <input
                    value={personal.phone}
                    onChange={(e) => setPersonal({ phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Your Role *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setPersonal({ role })}
                        className={`p-3 rounded-xl text-xs font-medium text-left transition-all ${
                          personal.role === role
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-app-text"
                            : "bg-app-card border border-app-border text-app-text-subtle hover:bg-app-card/[0.06]"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Business Profile */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400/70 mb-3">Step 2 of 3</p>
                <h1 className="text-3xl font-light text-app-text tracking-[-0.02em] mb-2">About your business</h1>
                <p className="text-sm text-app-text-subtle">This helps our AI understand your industry context.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Company Name *</label>
                  <input
                    value={business.companyName}
                    onChange={(e) => setBusiness({ companyName: e.target.value })}
                    placeholder="e.g., TechFlow Solutions Pvt Ltd"
                    className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Industry *</label>
                    <select
                      value={business.industry}
                      onChange={(e) => setBusiness({ industry: e.target.value })}
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text outline-none focus:border-emerald-500/30 transition-all"
                    >
                      <option value="" className="bg-app-card">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-app-card">{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Entity Type *</label>
                    <select
                      value={business.entityType}
                      onChange={(e) => setBusiness({ entityType: e.target.value })}
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text outline-none focus:border-emerald-500/30 transition-all"
                    >
                      <option value="" className="bg-app-card">Select type</option>
                      {ENTITY_TYPES.map((et) => (
                        <option key={et} value={et} className="bg-app-card">{et}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">
                    Brief about services & products
                    <span className="text-app-text/15 ml-1">(helps AI understand your business)</span>
                  </label>
                  <textarea
                    value={business.servicesDescription}
                    onChange={(e) => setBusiness({ servicesDescription: e.target.value })}
                    placeholder="e.g., We are a B2B SaaS company providing HR automation tools to mid-market companies in India. Our main products are payroll processing and employee engagement platforms."
                    rows={3}
                    className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Website URL</label>
                    <input
                      value={business.websiteUrl}
                      onChange={(e) => setBusiness({ websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Year Founded</label>
                    <input
                      value={business.yearFounded}
                      onChange={(e) => setBusiness({ yearFounded: e.target.value })}
                      placeholder="e.g., 2020"
                      type="number"
                      min="1900"
                      max="2026"
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Any major pivots in the business?</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setBusiness({ hadPivot: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium ${!business.hadPivot ? "bg-emerald-500/10 border border-emerald-500/20 text-app-text" : "bg-app-card border border-app-border text-app-text-subtle"}`}
                    >No</button>
                    <button
                      onClick={() => setBusiness({ hadPivot: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium ${business.hadPivot ? "bg-emerald-500/10 border border-emerald-500/20 text-app-text" : "bg-app-card border border-app-border text-app-text-subtle"}`}
                    >Yes</button>
                  </div>
                  {business.hadPivot && (
                    <input
                      value={business.pivotDescription}
                      onChange={(e) => setBusiness({ pivotDescription: e.target.value })}
                      placeholder="Briefly describe the pivot..."
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Annual Turnover</label>
                    <select
                      value={business.turnoverRange}
                      onChange={(e) => setBusiness({ turnoverRange: e.target.value })}
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text outline-none focus:border-emerald-500/30 transition-all"
                    >
                      <option value="" className="bg-app-card">Select range</option>
                      {TURNOVER_RANGES.map((tr) => (
                        <option key={tr} value={tr} className="bg-app-card">{tr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Accounting Software</label>
                    <select
                      value={business.accountingSoftware}
                      onChange={(e) => setBusiness({ accountingSoftware: e.target.value })}
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-4 py-3 text-sm text-app-text outline-none focus:border-emerald-500/30 transition-all"
                    >
                      <option value="" className="bg-app-card">Select software</option>
                      {ACCOUNTING_SOFTWARE.map((sw) => (
                        <option key={sw} value={sw} className="bg-app-card">{sw}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">GSTIN</label>
                    <input
                      value={business.gstin}
                      onChange={(e) => setBusiness({ gstin: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-3 py-3 text-xs text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">PAN</label>
                    <input
                      value={business.pan}
                      onChange={(e) => setBusiness({ pan: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-3 py-3 text-xs text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-text-subtle mb-1.5 font-medium">Employees</label>
                    <input
                      value={business.employeeCount}
                      onChange={(e) => setBusiness({ employeeCount: e.target.value })}
                      placeholder="e.g., 25"
                      type="number"
                      className="w-full rounded-xl bg-app-canvas border border-app-border px-3 py-3 text-xs text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Financial Data */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400/70 mb-3">Step 3 of 3</p>
                <h1 className="text-3xl font-light text-app-text tracking-[-0.02em] mb-2">Upload your financials</h1>
                <p className="text-sm text-app-text-subtle">Upload a Trial Balance or General Ledger to unlock AI-powered analysis.</p>
              </div>

              {/* Financial Year Selection */}
              <div>
                <label className="block text-xs text-app-text-subtle mb-2 font-medium">Select Financial Year(s) *</label>
                <div className="flex gap-2">
                  {FINANCIAL_YEARS.map((fy) => (
                    <button
                      key={fy}
                      onClick={() => toggleFY(fy)}
                      className={`flex-1 p-3 rounded-xl text-xs font-medium text-center transition-all ${
                        upload.financialYears.includes(fy)
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-app-text"
                          : "bg-app-card border border-app-border text-app-text-subtle hover:bg-app-card/[0.06]"
                      }`}
                    >
                      {fy}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onFileDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? "border-emerald-500/30 bg-emerald-500/100/5"
                    : "border-app-border hover:border-emerald-500/20 hover:bg-emerald-500/5"
                }`}
                onClick={() => document.getElementById("onboarding-file-input")?.click()}
              >
                <input
                  id="onboarding-file-input"
                  type="file"
                  // Broadened to cover the common formats finance people
                  // actually hand us: Excel (new + legacy), CSV, JSON,
                  // plus audited-statement PDFs. Backend parsers handle
                  // each format; tagging them here stops the native file
                  // picker from hiding legitimate files.
                  accept=".csv,.tsv,.json,.xlsx,.xls,.xlsm,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file);
                  }}
                />
                {uploadedFile ? (
                  <>
                    <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-app-text">{uploadedFile.name}</p>
                    <p className="text-xs text-app-text-subtle mt-1">{(uploadedFile.size / 1024).toFixed(0)} KB — Click to change</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-app-text/15 mx-auto mb-3" />
                    <p className="text-sm text-app-text-muted mb-1">Drop your Trial Balance, GL, or audited statements here</p>
                    <p className="text-xs text-app-text-subtle">Excel (.xlsx / .xls / .xlsm) &middot; CSV &middot; TSV &middot; JSON &middot; PDF</p>
                  </>
                )}
              </div>

              {/* Download sample */}
              <div className="flex items-center justify-center gap-2 text-xs text-app-text/15">
                <Info className="w-3 h-3" />
                <span>Need a sample? <button className="text-emerald-400 hover:text-emerald-400 underline">Download CSV template</button></span>
              </div>

              {/* OR Demo Mode */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-app-canvas" />
                <span className="text-xs text-app-text/15">OR</span>
                <div className="flex-1 h-px bg-app-canvas" />
              </div>

              <button
                onClick={handleDemoMode}
                className="w-full p-5 rounded-xl border border-app-border bg-app-card hover:bg-app-card-hover hover:border-app-border transition-all text-left flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-app-text">Explore Demo Environment</p>
                  <p className="text-xs text-app-text-subtle mt-0.5">Don&apos;t have data ready? Try with Acme Tech Pvt Ltd — a sample manufacturing company.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-app-text/15 ml-auto" />
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex items-center justify-between mt-10">
              {currentStep > 0 ? (
                <button onClick={handleBack} className="flex items-center gap-2 text-sm text-app-text-subtle hover:text-app-text/70 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-emerald-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm shadow-[0_4px_20px_rgba(52,211,153,0.25)]"
              >
                {currentStep === 2 ? "Analyze Now" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sample TB data for demo mode
function getSampleTB() {
  return [
    { account_name: "Share Capital", debit: 0, credit: 5000000 },
    { account_name: "Reserves & Surplus", debit: 0, credit: 1200000 },
    { account_name: "Secured Loan - Wells Fargo", debit: 0, credit: 3000000 },
    { account_name: "Sundry Creditors", debit: 0, credit: 850000 },
    { account_name: "GST Output Payable", debit: 0, credit: 180000 },
    { account_name: "TDS Payable", debit: 0, credit: 45000 },
    { account_name: "Outstanding Salary", debit: 0, credit: 320000 },
    { account_name: "Land & Building", debit: 4500000, credit: 0 },
    { account_name: "Plant & Machinery", debit: 2800000, credit: 0 },
    { account_name: "Furniture & Fixtures", debit: 350000, credit: 0 },
    { account_name: "Computer & Software", debit: 520000, credit: 0 },
    { account_name: "Depreciation", debit: 480000, credit: 0 },
    { account_name: "Cash in Hand", debit: 125000, credit: 0 },
    { account_name: "Bank Account - ICICI", debit: 1850000, credit: 0 },
    { account_name: "Sundry Debtors", debit: 1200000, credit: 0 },
    { account_name: "Stock-in-Trade", debit: 680000, credit: 0 },
    { account_name: "GST Input Credit", debit: 220000, credit: 0 },
    { account_name: "TDS Receivable", debit: 95000, credit: 0 },
    { account_name: "Sales Revenue", debit: 0, credit: 12500000 },
    { account_name: "Service Income", debit: 0, credit: 1800000 },
    { account_name: "Purchase of Goods", debit: 7200000, credit: 0 },
    { account_name: "Salary & Wages", debit: 2400000, credit: 0 },
    { account_name: "Rent Expense", debit: 600000, credit: 0 },
    { account_name: "Electricity Expense", debit: 180000, credit: 0 },
    { account_name: "Professional Fees", debit: 240000, credit: 0 },
    { account_name: "Advertisement Expense", debit: 350000, credit: 0 },
    { account_name: "Travelling Expense", debit: 185000, credit: 0 },
    { account_name: "Repair & Maintenance", debit: 120000, credit: 0 },
    { account_name: "Bank Charges", debit: 35000, credit: 0 },
    { account_name: "Interest on Loan", debit: 270000, credit: 0 },
  ];
}
