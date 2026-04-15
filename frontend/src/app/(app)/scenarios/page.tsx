"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Plus,
  Users,
  IndianRupee,
  Building,
  Banknote,
  GripVertical,
  AlertTriangle,
  Factory,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type EventType = "hiring" | "pricing" | "financing" | "opex" | "capex";

interface ScenarioEvent {
  id: string;
  title: string;
  month: string;
  type: EventType;
  color: string;
  impact: { burnDelta?: number; revenueDelta?: number; cashDelta?: number };
}

const EVENT_TYPE_META: Record<EventType, { icon: LucideIcon; label: string }> = {
  hiring: { icon: Users, label: "Hiring" },
  pricing: { icon: IndianRupee, label: "Pricing" },
  financing: { icon: Banknote, label: "Financing" },
  opex: { icon: Building, label: "OpEx" },
  capex: { icon: Factory, label: "Capex" },
};

const EVENTS: ScenarioEvent[] = [
  {
    id: "evt-1",
    title: "Hire 3 sales reps (Mumbai + Pune)",
    month: "Jun 2026",
    type: "hiring",
    color: "#10b981",
    impact: { burnDelta: 900000, revenueDelta: 650000 },
  },
  {
    id: "evt-2",
    title: "Price increase 8% on enterprise SKUs",
    month: "Aug 2026",
    type: "pricing",
    color: "#14b8a6",
    impact: { revenueDelta: 520000 },
  },
  {
    id: "evt-3",
    title: "MSME loan drawdown (HDFC, ₹2 Cr)",
    month: "Oct 2026",
    type: "financing",
    color: "#2dd4bf",
    impact: { cashDelta: 20000000, burnDelta: 180000 },
  },
  {
    id: "evt-4",
    title: "New plant &mdash; capex order",
    month: "Sep 2026",
    type: "capex",
    color: "#84cc16",
    impact: { cashDelta: -8500000 },
  },
  {
    id: "evt-5",
    title: "Open Bengaluru office",
    month: "Nov 2026",
    type: "opex",
    color: "#a3e635",
    impact: { burnDelta: 280000 },
  },
];

const FORECAST = {
  base: [
    { month: "May 2026", cash: 14500000, revenue: 8200000, burn: 3800000 },
    { month: "Jun 2026", cash: 14100000, revenue: 8450000, burn: 3900000 },
    { month: "Jul 2026", cash: 13700000, revenue: 8700000, burn: 4000000 },
    { month: "Aug 2026", cash: 13300000, revenue: 8950000, burn: 4050000 },
    { month: "Sep 2026", cash: 12850000, revenue: 9200000, burn: 4100000 },
    { month: "Oct 2026", cash: 12400000, revenue: 9480000, burn: 4200000 },
    { month: "Nov 2026", cash: 11950000, revenue: 9760000, burn: 4250000 },
    { month: "Dec 2026", cash: 11500000, revenue: 10050000, burn: 4300000 },
  ],
  best: [
    { month: "May 2026", cash: 14500000, revenue: 8450000, burn: 3750000 },
    { month: "Jun 2026", cash: 14250000, revenue: 8850000, burn: 3800000 },
    { month: "Jul 2026", cash: 14050000, revenue: 9400000, burn: 3850000 },
    { month: "Aug 2026", cash: 13900000, revenue: 10100000, burn: 3900000 },
    { month: "Sep 2026", cash: 13800000, revenue: 10800000, burn: 3950000 },
    { month: "Oct 2026", cash: 33650000, revenue: 11450000, burn: 4000000 },
    { month: "Nov 2026", cash: 33800000, revenue: 12150000, burn: 4100000 },
    { month: "Dec 2026", cash: 34100000, revenue: 12900000, burn: 4200000 },
  ],
  worst: [
    { month: "May 2026", cash: 14500000, revenue: 7900000, burn: 4100000 },
    { month: "Jun 2026", cash: 13850000, revenue: 7700000, burn: 4350000 },
    { month: "Jul 2026", cash: 13050000, revenue: 7500000, burn: 4500000 },
    { month: "Aug 2026", cash: 12150000, revenue: 7300000, burn: 4650000 },
    { month: "Sep 2026", cash: 11100000, revenue: 7100000, burn: 4800000 },
    { month: "Oct 2026", cash: 9900000, revenue: 6900000, burn: 4950000 },
    { month: "Nov 2026", cash: 8550000, revenue: 6750000, burn: 5050000 },
    { month: "Dec 2026", cash: 7050000, revenue: 6600000, burn: 5150000 },
  ],
};

const SCENARIOS = [
  { key: "base" as const, label: "Base case", color: "#10b981", description: "Current trajectory &middot; no major events" },
  { key: "best" as const, label: "Upside", color: "#22c55e", description: "Pricing + sales hires + MSME drawdown land" },
  { key: "worst" as const, label: "Downside", color: "#f43f5e", description: "GST rate hike + large receivable default" },
];

function fmt(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export default function ScenariosPage() {
  const [active, setActive] = useState<"base" | "best" | "worst">("base");
  const [enabled, setEnabled] = useState<Set<string>>(new Set(["evt-1", "evt-2"]));

  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeData = FORECAST[active];
  const last = activeData[activeData.length - 1];
  const runwayMonths = useMemo(() => {
    if (active === "best") return 999;
    return last.burn > 0 ? Math.max(0, Math.round(last.cash / last.burn)) : 0;
  }, [active, last]);

  const comparison = useMemo(() => {
    const row = (key: "base" | "best" | "worst") => {
      const data = FORECAST[key];
      const end = data[data.length - 1];
      const start = data[0];
      const avgBurn = Math.round(data.reduce((s, d) => s + d.burn, 0) / data.length);
      const growth = ((end.revenue - start.revenue) / start.revenue) * 100;
      return { end, avgBurn, growth };
    };
    return { base: row("base"), best: row("best"), worst: row("worst") };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400">Scenario canvas</p>
          </div>
          <h1 className="text-2xl font-bold text-white">Model different futures</h1>
          <p className="text-sm text-white/40 mt-1">
            Stack MSME-specific events on a base forecast &middot; see cash, revenue and runway move in real time.
          </p>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((s) => {
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                  : "bg-[#111] border-white/8 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/70"}`}>{s.label}</span>
              </div>
              <p className="text-xs text-white/40" dangerouslySetInnerHTML={{ __html: s.description }} />
            </button>
          );
        })}
      </div>

      {/* Forecast chart */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Cash balance forecast</h3>
            <p className="text-xs text-white/40 mt-0.5">May 2026 &ndash; Dec 2026</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {SCENARIOS.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-white/50">
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} /> {s.label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#999", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDuplicatedCategory={false}
            />
            <YAxis
              tick={{ fill: "#999", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmt(Number(v))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [fmt(Number(value)), ""]}
            />
            <Line
              data={FORECAST.base}
              type="monotone"
              dataKey="cash"
              stroke="#10b981"
              strokeWidth={active === "base" ? 2.5 : 1.25}
              dot={false}
              name="Base"
              opacity={active === "base" ? 1 : 0.25}
            />
            <Line
              data={FORECAST.best}
              type="monotone"
              dataKey="cash"
              stroke="#22c55e"
              strokeWidth={active === "best" ? 2.5 : 1.25}
              dot={false}
              name="Best"
              opacity={active === "best" ? 1 : 0.25}
            />
            <Line
              data={FORECAST.worst}
              type="monotone"
              dataKey="cash"
              stroke="#f43f5e"
              strokeWidth={active === "worst" ? 2.5 : 1.25}
              dot={false}
              name="Worst"
              opacity={active === "worst" ? 1 : 0.25}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Runway indicator */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-8 flex-wrap">
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Projected runway</p>
            <p
              className={`text-lg font-bold tabular-nums ${
                runwayMonths > 18 ? "text-emerald-400" : runwayMonths > 9 ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {runwayMonths > 100 ? "∞ (cash-flow positive)" : `${runwayMonths} months`}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Dec 2026 cash</p>
            <p className="text-lg font-bold text-white tabular-nums">{fmt(last.cash)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Dec 2026 revenue</p>
            <p className="text-lg font-bold text-white tabular-nums">{fmt(last.revenue)}</p>
          </div>
          {active === "worst" && (
            <div className="ml-auto flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-200">
                Runway compresses by Q3 &middot; consider pulling forward the MSME drawdown.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Event blocks + comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111] rounded-xl border border-white/8 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Event blocks</h3>
            <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              <Plus className="w-3 h-3" /> Add event
            </button>
          </div>
          <p className="text-xs text-white/40 mb-4">Toggle events on/off to see the impact on the forecast.</p>
          <div className="space-y-2.5">
            {EVENTS.map((event) => {
              const meta = EVENT_TYPE_META[event.type];
              const Icon = meta.icon;
              const isOn = enabled.has(event.id);
              return (
                <motion.div
                  key={event.id}
                  layout
                  onClick={() => toggle(event.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isOn
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/8 bg-white/[0.02] opacity-60 hover:opacity-90"
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-white/20" />
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${event.color}22` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: event.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm text-white truncate"
                      dangerouslySetInnerHTML={{ __html: event.title }}
                    />
                    <p className="text-[11px] text-white/40">
                      {event.month} &middot; {meta.label}
                    </p>
                  </div>
                  <div className="text-right text-[11px] tabular-nums leading-tight">
                    {event.impact.burnDelta !== undefined && (
                      <p className="text-rose-400">+{fmt(event.impact.burnDelta)}/mo burn</p>
                    )}
                    {event.impact.revenueDelta !== undefined && (
                      <p className="text-emerald-400">+{fmt(event.impact.revenueDelta)}/mo rev</p>
                    )}
                    {event.impact.cashDelta !== undefined && (
                      <p className={event.impact.cashDelta > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {event.impact.cashDelta > 0 ? "+" : ""}
                        {fmt(event.impact.cashDelta)} cash
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isOn ? "border-emerald-500 bg-emerald-500" : "border-white/15"
                    }`}
                  >
                    {isOn && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/8 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-semibold text-white">Scenario comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[11px] text-white/30 pb-3 font-medium">Metric</th>
                  <th className="text-right text-[11px] pb-3 font-medium" style={{ color: "#10b981" }}>Base</th>
                  <th className="text-right text-[11px] pb-3 font-medium" style={{ color: "#22c55e" }}>Upside</th>
                  <th className="text-right text-[11px] pb-3 font-medium" style={{ color: "#f43f5e" }}>Downside</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Dec 2026 cash"
                  base={fmt(comparison.base.end.cash)}
                  best={fmt(comparison.best.end.cash)}
                  worst={fmt(comparison.worst.end.cash)}
                />
                <ComparisonRow
                  label="Dec 2026 revenue"
                  base={fmt(comparison.base.end.revenue)}
                  best={fmt(comparison.best.end.revenue)}
                  worst={fmt(comparison.worst.end.revenue)}
                />
                <ComparisonRow
                  label="Avg monthly burn"
                  base={fmt(comparison.base.avgBurn)}
                  best={fmt(comparison.best.avgBurn)}
                  worst={fmt(comparison.worst.avgBurn)}
                />
                <ComparisonRow
                  label="Revenue growth (8 mo)"
                  base={`${comparison.base.growth.toFixed(1)}%`}
                  best={`${comparison.best.growth.toFixed(1)}%`}
                  worst={`${comparison.worst.growth.toFixed(1)}%`}
                />
                <ComparisonRow
                  label="Runway (months)"
                  base="36"
                  best="∞"
                  worst="14"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, base, best, worst }: { label: string; base: string; best: string; worst: string }) {
  return (
    <tr className="border-b border-white/3">
      <td className="py-3 text-xs text-white/40">{label}</td>
      <td className="py-3 text-xs text-right text-white/80 tabular-nums font-medium">{base}</td>
      <td className="py-3 text-xs text-right text-emerald-400 tabular-nums font-medium">{best}</td>
      <td className="py-3 text-xs text-right text-rose-400 tabular-nums font-medium">{worst}</td>
    </tr>
  );
}
