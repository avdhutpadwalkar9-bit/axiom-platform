"use client";

import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Upload,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

function fmtINR(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export default function UploadsPage() {
  const router = useRouter();
  const { lastResult, companyName, analysisDate, hasData } = useAnalysisStore();
  const { upload } = useOnboardingStore();

  const uploads = hasData && analysisDate
    ? [
        {
          id: "1",
          companyName,
          financialYear: upload.financialYears.join(", ") || "FY 2025-26",
          uploadDate: new Date(analysisDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          uploadTime: new Date(analysisDate).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "analyzed" as const,
          accounts: Object.values(lastResult?.classified_accounts || {}).flat().length,
          revenue: lastResult?.financial_statements.total_revenue || 0,
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Upload history</h1>
          <p className="text-sm text-white/40 mt-1">Manage your financial data uploads and run new analyses.</p>
        </div>
        <button
          onClick={() => router.push("/analysis")}
          className="flex items-center gap-2 bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors text-sm"
        >
          <Upload className="w-4 h-4" /> New upload
        </button>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-20 bg-[#111] rounded-xl border border-white/8">
          <FolderOpen className="w-12 h-12 text-white/15 mx-auto mb-4" />
          <p className="text-lg text-white/60 mb-2">No uploads yet</p>
          <p className="text-sm text-white/30 mb-6">Upload a Trial Balance or General Ledger to get started.</p>
          <button
            onClick={() => router.push("/analysis")}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-5 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload financial data
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((item) => (
            <div
              key={item.id}
              className="bg-[#111] rounded-xl border border-white/8 p-5 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{item.companyName}</h3>
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Analysed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-white/40 flex-wrap">
                    <span>{item.financialYear}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.uploadDate} at {item.uploadTime}
                    </span>
                    <span>{item.accounts} accounts</span>
                    <span>Revenue: {fmtINR(item.revenue)}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View analysis <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
