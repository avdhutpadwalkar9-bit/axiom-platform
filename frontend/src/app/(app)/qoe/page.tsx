"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { qoeAdjustments } from "@/lib/dummy-data";

const statusConfig = {
  flagged: { label: "Flagged", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: AlertTriangle },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: Clock },
};

function formatINR(value: number) {
  if (value === 0) return "—";
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export default function QoEPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(qoeAdjustments.map((c) => c.category))
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const totalFlagged = qoeAdjustments.flatMap((c) => c.items).filter((i) => i.status === "flagged").length;
  const totalPending = qoeAdjustments.flatMap((c) => c.items).filter((i) => i.status === "pending").length;
  const totalApproved = qoeAdjustments.flatMap((c) => c.items).filter((i) => i.status === "approved").length;
  const totalAddbacks = qoeAdjustments
    .flatMap((c) => c.items)
    .filter((i) => i.type === "addback" && i.status === "approved")
    .reduce((sum, i) => sum + Math.abs(i.amount), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quality of Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Continuous audit-readiness &middot; Compliance center</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/[0.08] transition-colors">
            <Download className="w-3 h-3" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/30 transition-colors">
            <FileText className="w-3 h-3" /> Generate QoE Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Items Flagged", value: totalFlagged, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Pending Review", value: totalPending, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Approved", value: totalApproved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Approved Add-backs", value: formatINR(totalAddbacks), icon: Shield, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((card) => (
          <div key={card.label} className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* EBITDA Bridge */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Adjusted EBITDA Bridge</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: "Reported EBITDA", value: "-₹8.5L", color: "bg-gray-600" },
            { label: "+", value: "", color: "" },
            { label: "One-time Legal", value: "+₹1.8L", color: "bg-emerald-500/60" },
            { label: "+", value: "", color: "" },
            { label: "Founder Comp Adj.", value: "+₹2.4L", color: "bg-emerald-500/60" },
            { label: "-", value: "", color: "" },
            { label: "Consulting Rev.", value: "-₹0.45L", color: "bg-red-500/60" },
            { label: "=", value: "", color: "" },
            { label: "Adjusted EBITDA", value: "-₹4.8L", color: "bg-indigo-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.color ? (
                <div className={`${item.color} rounded-xl px-5 py-3 text-center min-w-[120px]`}>
                  <p className="text-[10px] text-white/70 mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              ) : (
                <span className="text-xl text-gray-600 font-light px-1">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/5 p-1">
          {["all", "flagged", "pending", "approved"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                statusFilter === filter
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg border border-white/5 px-3 py-1.5">
          <Search className="w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search adjustments..."
            className="bg-transparent text-xs text-gray-300 outline-none w-48 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* QoE Categories */}
      <div className="space-y-4">
        {qoeAdjustments.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          const filteredItems = statusFilter === "all"
            ? category.items
            : category.items.filter((i) => i.status === statusFilter);

          if (filteredItems.length === 0) return null;

          return (
            <div key={category.category} className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <h3 className="text-sm font-semibold text-white">{category.category}</h3>
                  <span className="text-xs text-gray-500 bg-white/5 rounded-full px-2 py-0.5">
                    {filteredItems.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {category.items.filter((i) => i.status === "flagged").length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {category.items.filter((i) => i.status === "flagged").length} flagged
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="divide-y divide-white/[0.03]">
                    {filteredItems.map((item, i) => {
                      const config = statusConfig[item.status as keyof typeof statusConfig];
                      const StatusIcon = config.icon;
                      return (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.type}</p>
                          </div>
                          <div className="text-right">
                            {item.amount !== 0 && (
                              <p className={`text-sm font-medium ${
                                item.amount > 0 ? "text-amber-400" : "text-emerald-400"
                              }`}>
                                {formatINR(Math.abs(item.amount))}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* GST Health Panel */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">GST & Tax Compliance Health</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "GST Filing Status",
              status: "On Track",
              statusColor: "text-emerald-400",
              items: ["GSTR-1: Filed (Mar 2026)", "GSTR-3B: Filed (Mar 2026)", "GSTR-9: Due Jun 2026"],
            },
            {
              title: "Input Tax Credit",
              status: "₹4.8L Blocked",
              statusColor: "text-amber-400",
              items: ["3 vendors non-compliant on GSTR-2A", "ITC at risk: ₹4.8L", "Action: Send vendor notices"],
            },
            {
              title: "TDS Compliance",
              status: "1 Issue",
              statusColor: "text-amber-400",
              items: ["TDS filed for Q4 FY26", "Short deduction flagged: ₹12K", "26AS reconciliation: 97% matched"],
            },
          ].map((panel) => (
            <div key={panel.title} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400">{panel.title}</p>
                <span className={`text-xs font-medium ${panel.statusColor}`}>{panel.status}</span>
              </div>
              <ul className="space-y-2">
                {panel.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
