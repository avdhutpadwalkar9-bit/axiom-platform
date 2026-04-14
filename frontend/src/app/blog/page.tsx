"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const articles = [
  {
    category: "Compliance",
    title: "Understanding Ind AS 115 for MSMEs",
    description: "A practical breakdown of the revenue recognition standard and what it means for small and medium enterprises navigating compliance for the first time.",
    readTime: "8 min read",
    date: "Mar 28, 2026",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    category: "AI Finance",
    title: "5 Financial Ratios Every Founder Should Track",
    description: "From current ratio to debt-to-equity, learn which numbers actually matter when making decisions about hiring, fundraising, and growth strategy.",
    readTime: "5 min read",
    date: "Mar 21, 2026",
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    category: "Industry Analysis",
    title: "How AI is Transforming FP&A in India",
    description: "Indian CFOs are adopting AI faster than ever. Explore how financial planning and analysis is evolving from spreadsheets to intelligent automation.",
    readTime: "10 min read",
    date: "Mar 14, 2026",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    category: "Cash Flow",
    title: "Cash Flow Management for Manufacturing MSMEs",
    description: "Manufacturing businesses face unique working capital challenges. Discover strategies for managing receivables, inventory, and seasonal cash cycles.",
    readTime: "7 min read",
    date: "Mar 7, 2026",
    color: "bg-orange-500/10 text-orange-400",
  },
  {
    category: "Accounting",
    title: "The Complete Guide to Trial Balance Analysis",
    description: "What a Trial Balance really tells you beyond debits and credits. Learn how to spot anomalies, assess financial health, and prepare for audits.",
    readTime: "12 min read",
    date: "Feb 28, 2026",
    color: "bg-cyan-500/10 text-cyan-400",
  },
  {
    category: "Investor Readiness",
    title: "Quality of Earnings: What Investors Look For",
    description: "Before raising a round, understand how investors evaluate earnings quality. Normalize one-time items, assess revenue sustainability, and present clean financials.",
    readTime: "9 min read",
    date: "Feb 21, 2026",
    color: "bg-pink-500/10 text-pink-400",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <BookOpen className="w-3.5 h-3.5" />
              Coming soon &mdash; First articles drop April 22
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Resources &amp; Insights
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
              Deep dives into financial analysis, Ind AS compliance, AI in finance,
              and strategies for growing Indian businesses.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20"
            >
              Get notified when we publish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── Article grid (non-clickable previews) ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto mb-8 text-center">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em]">
            Upcoming titles
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="group block bg-white/[0.02] border border-white/8 rounded-2xl p-6 h-full relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/50" />
                <div className="relative flex items-center justify-between mb-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${article.color}`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] font-semibold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Coming soon
                  </span>
                </div>
                <h3 className="relative text-base font-semibold mb-2 leading-snug text-white/80">
                  {article.title}
                </h3>
                <p className="relative text-sm text-white/35 leading-relaxed mb-6">
                  {article.description}
                </p>
                <div className="relative flex items-center gap-4 text-xs text-white/25 mt-auto">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center bg-white/[0.02] border border-white/8 rounded-2xl p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to see it in action?</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm">
              Upload your Trial Balance and get AI-powered financial analysis, Ind AS compliance review, and strategic insights in under 60 seconds.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
