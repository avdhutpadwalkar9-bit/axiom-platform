"use client";

import { useState } from "react";
import {
  ArrowRight,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

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
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Submission failed (${res.status})`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again or email hello@cortexcfo.com.",
      );
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

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
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message sent</h3>
                  <p className="text-white/55 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                    A real human will respond within 24 hours on business days. We&rsquo;ve also sent a copy to{" "}
                    <span className="text-white/80 font-medium break-all">
                      {formData.email}
                    </span>{" "}
                    so you have it on file.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      disabled={status === "submitting"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      disabled={status === "submitting"}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      disabled={status === "submitting"}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your company name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      required
                      rows={5}
                      disabled={status === "submitting"}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors resize-none disabled:opacity-60"
                    />
                  </div>
                  {status === "error" && errorMessage && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-[13px] leading-relaxed"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-emerald-500 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-white/30 text-center leading-relaxed pt-1">
                    We reply within 24 hours on business days. Or email{" "}
                    <a
                      href="mailto:hello@cortexcfo.com"
                      className="text-white/50 hover:text-emerald-400 transition-colors underline underline-offset-2"
                    >
                      hello@cortexcfo.com
                    </a>{" "}
                    directly.
                  </p>
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

      <SiteFooter />
    </div>
  );
}
