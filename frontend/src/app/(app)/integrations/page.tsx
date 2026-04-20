"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plug, Check, RefreshCw, Search, ExternalLink, Globe } from "lucide-react";
import { integrations } from "@/lib/dummy-data";
import { useOnboardingStore } from "@/stores/onboardingStore";

type RegionFilter = "US" | "IN" | "all";

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  // Default the region filter to whatever the user picked in onboarding.
  // INR reporting → India region view. Anything else → US view. Users
  // can flip to "All regions" at the top of the page.
  const onboardingRegion = useOnboardingStore((s) => s.business.region) ?? "US";
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(
    onboardingRegion === "IN" ? "IN" : "US",
  );

  const filtered = useMemo(() => {
    return integrations.filter((i) => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || i.category === category;
      // Region-agnostic integrations (Stripe, Plaid) always show.
      const matchesRegion =
        regionFilter === "all" || i.region === regionFilter || i.region === "all";
      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [search, category, regionFilter]);

  const categories = Array.from(new Set(integrations.map((i) => i.category)));
  const connectedCount = filtered.filter((i) => i.status === "connected").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-app-text">Integrations</h1>
          <p className="text-sm text-app-text-subtle mt-1">
            {connectedCount} connected &middot; {filtered.length - connectedCount} available
            {regionFilter !== "all" && (
              <span className="ml-2 text-app-text-subtle">
                · {regionFilter === "IN" ? "India region" : "US region"}
              </span>
            )}
          </p>
        </div>

        {/* Region dropdown — primary filter, controls which stack shows */}
        <div className="inline-flex items-center gap-1 bg-app-card border border-app-border rounded-lg p-1">
          <Globe className="w-3.5 h-3.5 text-app-text-subtle ml-2 mr-1" />
          {(["US", "IN", "all"] as RegionFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                regionFilter === r
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-app-text-subtle hover:text-app-text-muted"
              }`}
            >
              {r === "US" ? "US apps" : r === "IN" ? "India apps" : "All regions"}
            </button>
          ))}
        </div>
      </div>

      {/* Search + category filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-app-card rounded-lg border border-app-border px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-app-text-subtle" />
          <input
            type="text"
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-app-text outline-none w-full placeholder:text-app-text-subtle"
          />
        </div>
        <div className="flex items-center gap-1 bg-app-card rounded-lg border border-app-border p-1">
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              category === "all"
                ? "bg-app-card-hover text-app-text"
                : "text-app-text-subtle hover:text-app-text-muted"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                category === cat
                  ? "bg-app-card-hover text-app-text"
                  : "text-app-text-subtle hover:text-app-text-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-app-text-subtle border border-app-border rounded-xl bg-app-card">
          No integrations match your filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.04 }}
              className={`relative rounded-xl p-5 border transition-all ${
                integration.status === "connected"
                  ? "bg-app-card-hover border-emerald-500/20"
                  : "bg-app-card border-app-border hover:border-app-border-strong"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: `${integration.color}20`,
                      color: integration.color,
                    }}
                  >
                    {integration.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-app-text">{integration.name}</h3>
                    <p className="text-xs text-app-text-subtle">
                      {integration.category}
                      {integration.region !== "all" && (
                        <>
                          {" · "}
                          <span className="text-app-text-subtle/80">
                            {integration.region === "IN" ? "India" : "US"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {integration.status === "connected" && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <Check className="w-3 h-3" /> Connected
                  </div>
                )}
              </div>

              {integration.status === "connected" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-app-text-subtle">
                    <RefreshCw className="w-3 h-3" /> Last sync: {integration.lastSync}
                  </div>
                  <button className="text-xs text-app-text-subtle hover:text-app-text transition-colors">
                    Settings
                  </button>
                </div>
              ) : (
                <button className="w-full py-2 rounded-lg bg-app-canvas border border-app-border text-xs text-app-text-muted hover:bg-app-card-hover hover:text-app-text transition-all flex items-center justify-center gap-1.5">
                  <Plug className="w-3 h-3" /> Connect
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Compliance placeholder — intentionally soft until we ship the
          per-region compliance engine. Backend logic stays intact; this
          just avoids claims we haven't earned yet. */}
      <div className="rounded-xl border border-app-border bg-app-card p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-app-text">
            Compliance connections — coming soon
          </p>
          <p className="text-xs text-app-text-subtle mt-0.5 leading-relaxed">
            Tax authority pulls (GSTN, ITR, MCA, IRS e-Services) are being
            reviewed by our in-house experts before enablement. Until then,
            upload the relevant export to{" "}
            <span className="text-app-text-muted">Analysis → Compliance tab</span>{" "}
            and we&rsquo;ll handle the rest.
          </p>
        </div>
      </div>

      {/* Custom API CTA */}
      <div className="bg-app-card rounded-xl border border-app-border p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-app-text mb-1">Custom Integration</h3>
            <p className="text-xs text-app-text-subtle">
              Use our REST API to connect any data source. Full documentation available.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-app-canvas border border-app-border rounded-lg text-xs text-app-text-muted hover:bg-app-card-hover hover:text-app-text transition-colors">
            <ExternalLink className="w-3 h-3" /> API Docs
          </button>
        </div>
      </div>
    </div>
  );
}
