"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Upload, FileSpreadsheet, Clock, CheckCircle2, ArrowRight, Trash2 } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function UploadsPage() {
  const router = useRouter();
  const { lastResult, companyName, analysisDate, hasData } = useAnalysisStore();
  const { upload } = useOnboardingStore();

  // Build upload history from stored data
  const uploads = hasData && analysisDate
    ? [
        {
          id: "1",
          companyName: companyName,
          financialYear: upload.financialYears.join(", ") || "FY 2025-26",
          uploadDate: new Date(analysisDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          uploadTime: new Date(analysisDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "analyzed" as const,
          accounts: Object.values(lastResult?.classified_accounts || {}).flat().length,
          revenue: lastResult?.financial_statements.total_revenue || 0,
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Upload History</h1>
          <p className="text-sm text-white/40 mt-1">Manage your financial data uploads and run new analyses.</p>
        </div>
        <button
          onClick={() => router.push("/analysis")}
          className="flex items-center gap-2 bg-white text-[#0a0a0f] font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-all text-sm"
        >
          <Upload className="w-4 h-4" /> New Upload
        </button>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-lg text-white/40 mb-2">No uploads yet</p>
          <p className="text-sm text-white/20 mb-6">Upload a Trial Balance or General Ledger to get started.</p>
          <button
            onClick={() => router.push("/analysis")}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-5 py-2.5 rounded-full text-sm hover:bg-white/10 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Financial Data
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="bg-white/[0.03] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{upload.companyName}</h3>
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Analyzed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-white/30">
                    <span>{upload.financialYear}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {upload.uploadDate} at {upload.uploadTime}</span>
                    <span>{upload.accounts} accounts</span>
                    <span>Revenue: ₹{(upload.revenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View Analysis <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
