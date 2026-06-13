// app/privacy/page.tsx
import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Invokix",
  description: "How Invokix collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "June 13, 2025"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white overflow-x-hidden">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70">Legal</p>
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
          <div className="h-px bg-white/5 mt-6" />
        </div>

        {/* Prose */}
        <div className="prose prose-invert prose-zinc max-w-none space-y-10 text-zinc-400 leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">1. Who we are</h2>
            <p>
              Invokix (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an API contract management platform operated by Anurag Singh.
              Our registered contact email is{" "}
              <a href="mailto:hello@invokix.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                hello@invokix.com
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">2. Information we collect</h2>
            <p>We collect information you provide directly, including:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-2">
              <li>Name and email address when you create an account</li>
              <li>API contract data, endpoints, and schema definitions you create</li>
              <li>Billing information processed securely through our payment provider</li>
              <li>Usage data such as feature interactions and page views</li>
              <li>Communications you send us via email or support channels</li>
            </ul>
            <p>
              We also automatically collect certain technical data when you use our service, including IP address,
              browser type, operating system, referring URLs, and cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">3. How we use your information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-2">
              <li>Provide, maintain, and improve the Invokix platform</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyse usage trends to improve user experience</li>
              <li>Detect and prevent fraudulent or abusive activity</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">4. Information sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your
              information in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-2">
              <li>With service providers who assist in operating our platform (e.g., hosting, analytics)</li>
              <li>When required by law or to respond to legal process</li>
              <li>To protect the rights and safety of Invokix and our users</li>
              <li>In connection with a merger, acquisition, or sale of assets (with notice to you)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">5. Data retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services.
              You may request deletion of your account and associated data at any time by contacting us. We will
              fulfil your request within 30 days, subject to legal obligations to retain certain records.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">6. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service. Cookies are small
              data files stored on your device. You can instruct your browser to refuse all cookies; however, some
              parts of our service may not function properly as a result.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">7. Security</h2>
            <p>
              We use commercially reasonable technical and organisational measures to protect your information.
              All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. However, no
              method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">8. Your rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Data portability (receive a copy of your data in a machine-readable format)</li>
            </ul>
            <p>
              To exercise any of these rights, please email{" "}
              <a href="mailto:hello@invokix.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                hello@invokix.com
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of
              Invokix after changes become effective constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:hello@invokix.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                hello@invokix.com
              </a>.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-6">
          <Link href="/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms of Service →</Link>
          <Link href="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">About →</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
