"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Send,
} from "lucide-react";
import { FadeIn } from "@/components/Animate";

const faqs = [
  {
    q: "How quickly will I get a response?",
    a: "Our team typically responds within 24 hours on business days. For urgent queries, mention it in the subject and we will prioritize your request.",
  },
  {
    q: "Can I schedule a live demo?",
    a: "Absolutely. Fill out the contact form mentioning you would like a demo, and our team will set up a personalized walkthrough of CortexCFO tailored to your industry.",
  },
  {
    q: "Is there phone support?",
    a: "We currently offer support via email and the in-app chat. Phone support is available for Pro and Enterprise plan customers.",
  },
];

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── Nav ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">CortexCFO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
            <Link href="/#capabilities" className="hover:text-white transition-colors">Capabilities</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Resources</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-white/50 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-[13px] bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 transition-all font-medium">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <Mail className="w-3.5 h-3.5" />
              We would love to hear from you
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Get in touch
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Have a question about CortexCFO? Want to see a demo? Drop us a message and our team will get back to you within 24 hours.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Contact form + side info ─── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">
          {/* Form */}
          <FadeIn className="md:col-span-3">
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message sent</h3>
                  <p className="text-white/40 text-sm">We will get back to you within 24 hours. Check your inbox for a confirmation.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your company name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2"
                  >
                    Send message <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </FadeIn>

          {/* Side info */}
          <FadeIn delay={200} className="md:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email us</p>
                  <a href="mailto:hello@cortexcfo.com" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">hello@cortexcfo.com</a>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Office</p>
                  <p className="text-sm text-white/40">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Response time</p>
                  <p className="text-sm text-white/40">Within 24 hours on business days</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs text-white/25 uppercase tracking-wider font-semibold mb-4">Common questions</p>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm text-white/70">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-white/35 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                <span className="text-sm font-semibold">CortexCFO</span>
              </div>
              <p className="text-xs text-white/25 leading-relaxed">AI-powered financial intelligence for Indian businesses.</p>
            </div>
            {[
              { title: "Product", links: [{ label: "Dashboard", href: "/dashboard" }, { label: "TB Analysis", href: "/analysis" }, { label: "Industries", href: "/industries" }] },
              { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
              { title: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">{col.title}</p>
                <ul className="space-y-2">{col.links.map((l) => <li key={l.label}><Link href={l.href} className="text-sm text-white/30 hover:text-white/60 transition-colors">{l.label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex items-center justify-between">
            <p className="text-xs text-white/20">&copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.</p>
            <div className="flex gap-4 text-xs text-white/20">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white/40">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-white/40">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
