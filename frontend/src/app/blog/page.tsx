"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText, MessageSquare } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <BookOpen className="w-3.5 h-3.5" />
              Resources &amp; insights
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Writing in progress.
            </h1>
            <p className="text-lg text-white/55 max-w-xl mx-auto mb-8 leading-relaxed">
              We&rsquo;re heads down on the product. Long-form posts on QoE methodology,
              Adjusted EBITDA add-backs, GAAP / Ind AS for MSMEs, and pre-diligence
              prep are on the way. Drop us a line and we&rsquo;ll send the first one
              when it&rsquo;s ready.
            </p>
            <Link
              href="/contact?intent=blog-notify"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20"
            >
              Get notified when we publish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── In the meantime ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-center text-xs font-semibold text-white/40 uppercase tracking-[0.2em] mb-8">
              In the meantime
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            <FadeIn delay={80}>
              <Link
                href="/how-it-works"
                className="group block bg-white/[0.02] border border-white/8 rounded-2xl p-6 h-full hover:border-emerald-500/30 hover:bg-[#131313] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">
                  How CortexCFO works
                </h3>
                <p className="text-sm text-white/55 leading-relaxed mb-4">
                  Our QoE methodology, the add-back framework we use, and how a
                  qualified CA reviews every report before you see it.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
                  Read the methodology <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </FadeIn>

            <FadeIn delay={160}>
              <Link
                href="/contact"
                className="group block bg-white/[0.02] border border-white/8 rounded-2xl p-6 h-full hover:border-emerald-500/30 hover:bg-[#131313] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">
                  Ask the founders
                </h3>
                <p className="text-sm text-white/55 leading-relaxed mb-4">
                  Until the blog ships, the fastest way to get a specific question
                  answered is to email us. We reply ourselves, usually same day.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
                  Send a question <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
