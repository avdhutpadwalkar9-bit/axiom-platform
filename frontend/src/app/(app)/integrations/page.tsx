"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plug, Check, RefreshCw, Search, ExternalLink } from "lucide-react";
import { integrations } from "@/lib/dummy-data";

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = [...new Set(integrations.map((i) => i.category))];
  const filtered = integrations.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || i.category === filter;
    return matchesSearch && matchesFilter;
  });

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {connectedCount} connected &middot; {integrations.length - connectedCount} available
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg border border-white/5 px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none w-full placeholder:text-gray-600"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/5 p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "all" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === cat ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative rounded-xl p-5 border transition-all hover:border-white/10 ${
              integration.status === "connected"
                ? "bg-white/[0.04] border-white/10"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: `${integration.color}20`, color: integration.color }}
                >
                  {integration.logo}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                  <p className="text-xs text-gray-500">{integration.category}</p>
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
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <RefreshCw className="w-3 h-3" /> Last sync: {integration.lastSync}
                </div>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">
                  Settings
                </button>
              </div>
            ) : (
              <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                <Plug className="w-3 h-3" /> Connect
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* API Section */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Custom Integration</h3>
            <p className="text-xs text-gray-500">
              Use our REST API to connect any data source. Full documentation available.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors">
            <ExternalLink className="w-3 h-3" /> API Docs
          </button>
        </div>
      </div>
    </div>
  );
}
