"use client";

import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPage() {

  const sections = [
    {
      title: "1. Data Collection",
      content: "We collect information you provide directly, such as your name, email address, company name, and financial data uploaded to the platform. We also collect usage data automatically, including browser type, device information, IP address, and interaction patterns within the application. Financial data you upload (Trial Balance, ledger exports) is processed solely for analysis and is never used to train our AI models."
    },
    {
      title: "2. How We Use Your Data",
      content: "Your data is used to provide and improve the CortexCFO platform, including financial analysis, scenario modeling, QoE assessments, and AI-generated insights. We use aggregated, anonymized usage data to improve our algorithms and platform performance. We do not sell, rent, or share your personal or financial data with third parties for marketing purposes."
    },
    {
      title: "3. Data Storage & Security",
      content: "All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. Financial data is stored in SOC 2 Type II certified data centers with data residency options in India. We maintain strict access controls, audit logging, and regular penetration testing. Backups are encrypted and stored in geographically separated locations within India."
    },
    {
      title: "4. Data Retention",
      content: "We retain your account data for as long as your account is active. Financial data uploaded to the platform is retained for the duration of your subscription plus 90 days. You may request deletion of your data at any time through your account settings or by contacting our support team. Upon account deletion, all associated data is permanently removed within 30 days."
    },
    {
      title: "5. Your Rights",
      content: "Under the India Digital Personal Data Protection Act (DPDP) and GDPR (where applicable), you have the right to access, correct, delete, and port your personal data. You may withdraw consent for data processing at any time. You have the right to lodge a complaint with a supervisory authority. To exercise any of these rights, contact us at privacy@cortexcfo.in."
    },
    {
      title: "6. Cookies & Tracking",
      content: "We use essential cookies to maintain your session and preferences. Analytics cookies are used only with your consent to help us understand how the platform is used. We do not use third-party advertising cookies. You can manage cookie preferences through your browser settings or our cookie consent banner."
    },
    {
      title: "7. Third-Party Services",
      content: "We integrate with accounting platforms (Tally, Zoho), payment processors, and cloud infrastructure providers. These integrations are governed by their respective privacy policies. We share only the minimum data necessary for each integration to function. A full list of sub-processors is available upon request."
    },
    {
      title: "8. Contact Us",
      content: "For privacy-related inquiries, contact our Data Protection Officer at privacy@cortexcfo.in or write to: CortexCFO Financial Intelligence Pvt. Ltd., WeWork Embassy Golf Links, Bangalore, Karnataka 560071, India."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <SiteNav />

      {/* Hero */}
      <section className="relative bg-[#1a1a17] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 pt-40 pb-20 w-full">
          <div className="max-w-[700px] mx-auto text-center">
            <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] font-light tracking-[-0.04em] leading-[1.1] mb-6">
              Privacy <span className="italic font-normal">Policy</span>
            </h1>
            <p className="text-[15px] text-white/40">Last updated: April 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[16px] text-white/40 leading-[1.8] mb-12">
            At CortexCFO, we take the privacy and security of your financial data seriously.
            This Privacy Policy explains how we collect, use, store, and protect your information
            when you use the CortexCFO platform and related services.
          </p>
          <div className="space-y-10">
            {sections.map(section => (
              <div key={section.title}>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-4">{section.title}</h2>
                <p className="text-[15px] text-white/40 leading-[1.8]">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related links */}
      <section className="py-16 px-8 bg-[#080808] border-t border-white/5">
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/terms" className="text-[14px] text-[#666] hover:text-white transition-colors font-medium underline underline-offset-4">
            Terms of Service
          </Link>
          <span className="text-white/10 hidden sm:inline">|</span>
          <Link href="/about" className="text-[14px] text-[#666] hover:text-white transition-colors font-medium underline underline-offset-4">
            About CortexCFO
          </Link>
          <span className="text-white/10 hidden sm:inline">|</span>
          <Link href="/" className="text-[14px] text-[#666] hover:text-white transition-colors font-medium underline underline-offset-4">
            Back to Home
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
