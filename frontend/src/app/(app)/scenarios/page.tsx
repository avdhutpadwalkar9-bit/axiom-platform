"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Plus,
  Users,
  DollarSign,
  Building,
  Banknote,
  X,
  GripVertical,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { scenarioEvents, forecastData } from "@/lib/dummy-data";

const eventTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  hiring: { icon: Users, label: "Hiring" },
  pricing: { icon: DollarSign, label: "Pricing" },
  funding: { icon: Banknote, label: "Funding" },
  opex: { icon: Building, label: "OpEx" },
};

function formatCurrency(value: number) {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function ScenariosPage() {
  const [activeScenario, setActiveScenario] = useState<"base" | "best" | "worst">("base");
  const [events, setEvents] = useState(scenarioEvents);
  const [enabledEvents, setEnabledEvents] = useState<Set<string>>(new Set(["evt-1", "evt-2"]));
  const [showAddEvent, setShowAddEvent] = useState(false);

  const toggleEvent = (id: string) => {
    setEnabledEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scenarios = [
    { key: "base" as const, label: "Base Case", color: "#6366f1", description: "Current trajectory with no changes" },
    { key: "best" as const, label: "Best Case", color: "#22c55e", description: "All events enabled + optimistic growth" },
    { key: "worst" as const, label: "Worst Case", color: "#ef4444", description: "Churn spike + delayed fundraise" },
  ];

  // Calculate runway for active scenario
  const activeData = forecastData[activeScenario];
  const lastMonth = activeData[activeData.length - 1];
  const runwayMonths = activeScenario === "worst"
    ? Math.ceil(lastMonth.cash / lastMonth.burn)
    : activeScenario === "best" ? 999 : Math.ceil(lastMonth.cash / lastMonth.burn);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Scenario Canvas</h1>
          <p className="text-sm text-[#999] mt-1">Model different futures. Decide with confidence.</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveScenario(s.key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeScenario === s.key
                ? "bg-[#fafafa] border-emerald-200"
                : "bg-white border-[#e5e5e5] hover:border-[#e5e5e5]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-semibold text-[#1a1a1a]">{s.label}</span>
            </div>
            <p className="text-xs text-[#999]">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Cash Balance Forecast</h3>
            <p className="text-xs text-[#999] mt-0.5">May 2026 — Dec 2026</p>
          </div>
          <div className="flex items-center gap-4">
            {scenarios.map((s) => (
              <label key={s.key} className="flex items-center gap-1.5 text-xs text-[#999] cursor-pointer">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </label>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDuplicatedCategory={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
            />
            <Line data={forecastData.base} type="monotone" dataKey="cash" stroke="#6366f1" strokeWidth={activeScenario === "base" ? 3 : 1.5} dot={false} name="Base" opacity={activeScenario === "base" ? 1 : 0.3} />
            <Line data={forecastData.best} type="monotone" dataKey="cash" stroke="#22c55e" strokeWidth={activeScenario === "best" ? 3 : 1.5} dot={false} name="Best" opacity={activeScenario === "best" ? 1 : 0.3} />
            <Line data={forecastData.worst} type="monotone" dataKey="cash" stroke="#ef4444" strokeWidth={activeScenario === "worst" ? 3 : 1.5} dot={false} name="Worst" opacity={activeScenario === "worst" ? 1 : 0.3} strokeDasharray={activeScenario === "worst" ? "0" : "6 3"} />
          </LineChart>
        </ResponsiveContainer>

        {/* Runway indicator */}
        <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex items-center gap-6">
          <div>
            <p className="text-xs text-[#999]">Projected Runway</p>
            <p className={`text-lg font-bold ${runwayMonths > 12 ? "text-emerald-400" : runwayMonths > 6 ? "text-amber-400" : "text-red-400"}`}>
              {runwayMonths > 100 ? "∞ (cash-flow positive)" : `${runwayMonths} months`}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#999]">End-of-Year Cash</p>
            <p className="text-lg font-bold text-[#1a1a1a]">{formatCurrency(lastMonth.cash)}</p>
          </div>
          <div>
            <p className="text-xs text-[#999]">Dec 2026 Revenue</p>
            <p className="text-lg font-bold text-[#1a1a1a]">{formatCurrency(lastMonth.revenue)}</p>
          </div>
          {activeScenario === "worst" && (
            <div className="ml-auto flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">Cash hits critical level by Q4. Consider accelerating fundraise.</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Blocks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event Timeline */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Event Blocks</h3>
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-600 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Event
            </button>
          </div>
          <p className="text-xs text-[#999] mb-4">Toggle events on/off to see their impact on the forecast</p>
          <div className="space-y-3">
            {events.map((event) => {
              const config = eventTypeConfig[event.type];
              const Icon = config.icon;
              const isEnabled = enabledEvents.has(event.id);
              return (
                <motion.div
                  key={event.id}
                  layout
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    isEnabled
                      ? "bg-[#f5f5f5] border-[#e5e5e5]"
                      : "bg-white border-[#e5e5e5] opacity-50"
                  }`}
                  onClick={() => toggleEvent(event.id)}
                >
                  <GripVertical className="w-4 h-4 text-[#666] cursor-grab" />
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${event.color}20` }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a]">{event.title}</p>
                    <p className="text-xs text-[#999]">{event.month} &middot; {config.label}</p>
                  </div>
                  <div className="text-right">
                    {event.impact.burnRate > 0 && (
                      <p className="text-xs text-red-400">+{formatCurrency(event.impact.burnRate)}/mo burn</p>
                    )}
                    {event.impact.revenue > 0 && (
                      <p className="text-xs text-emerald-400">+{formatCurrency(event.impact.revenue)}/mo rev</p>
                    )}
                    {event.impact.cash && (
                      <p className="text-xs text-blue-400">+{formatCurrency(event.impact.cash)} cash</p>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isEnabled ? "border-indigo-500 bg-emerald-600" : "border-gray-600"
                  }`}>
                    {isEnabled && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
          <h3 className="text-sm font-semibold text-[#1a1a1a] mb-5">Scenario Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left text-xs text-[#999] pb-3 font-medium">Metric</th>
                  <th className="text-right text-xs pb-3 font-medium" style={{ color: "#6366f1" }}>Base</th>
                  <th className="text-right text-xs pb-3 font-medium" style={{ color: "#22c55e" }}>Best</th>
                  <th className="text-right text-xs pb-3 font-medium" style={{ color: "#ef4444" }}>Worst</th>
                </tr>
              </thead>
              <tbody className="text-[#666]">
                {[
                  { metric: "End-of-Year Cash", base: "$870K", best: "$6.6M", worst: "$403K" },
                  { metric: "Dec Revenue", base: "$156K", best: "$239K", worst: "$99K" },
                  { metric: "Runway (months)", base: "10", best: "∞", worst: "3.3" },
                  { metric: "Avg Monthly Burn", base: "$85K", best: "$80K", worst: "$121K" },
                  { metric: "Revenue Growth", base: "3%", best: "10%", worst: "-3%" },
                  { metric: "Breakeven Date", base: "Mar 2027", best: "Oct 2026", worst: "Never" },
                  { metric: "Headcount (Dec)", base: "42", best: "48", worst: "35" },
                ].map((row) => (
                  <tr key={row.metric} className="border-b border-[#f0f0f0]">
                    <td className="py-3 text-xs text-[#999]">{row.metric}</td>
                    <td className="py-3 text-xs text-right font-medium">{row.base}</td>
                    <td className="py-3 text-xs text-right font-medium text-emerald-400">{row.best}</td>
                    <td className="py-3 text-xs text-right font-medium text-red-400">{row.worst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
