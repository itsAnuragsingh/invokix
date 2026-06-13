// app/terms/page.tsx
import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Invokix",
  description: "The terms and conditions governing your use of Invokix.",
}

const LAST_UPDATED = "June 13, 2025"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white overflow-x-hidden">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70">Legal</p>
          <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
          <div className="h-px bg-white/5 mt-6" />
        </div>

        {/* Prose */}
        <div className="space-y-10 text-zinc-400 leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">1. Acceptance of terms</h2>
            <p>
              By accessing or using Invokix (&quot;the Service&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service. These Terms apply
              to all users, including visitors and registered account holders.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">2. Description of service</h2>
            <p>
              Invokix is an API contract management platform that enables teams to design, version, generate
              code from, and monitor API contracts. We reserve the right to modify, suspend, or discontinue
              any part of the Service at any time with reasonable notice where possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">3. Accounts</h2>
            <p>
              You must create an account to access most features of the Service. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorised access</li>
            </ul>
            <p>
              You must be at least 16 years of age to create an account. By creating an account, you represent
              that you meet this requirement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">4. Acceptable use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Upload or transmit malicious code or content</li>
              <li>Attempt to gain unauthorised access to any systems or networks</li>
              <li>Engage in any activity that disrupts or interferes with the Service</li>
              <li>Use automated means to access the Service without our prior written consent</li>
              <li>Resell or commercially exploit the Service without authorisation</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">5. Your content</h2>
            <p>
              You retain ownership of all API contracts, schemas, and other content you create on Invokix
              (&quot;Your Content&quot;). By using the Service, you grant us a limited, non-exclusive licence to host,
              process, and display Your Content solely to provide the Service to you.
            </p>
            <p>
              You represent that you have all necessary rights to the content you upload and that Your Content
              does not violate these Terms or any applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">6. Billing and subscriptions</h2>
            <p>
              Certain features of Invokix require a paid subscription. By subscribing, you agree to pay the
              applicable fees as described on our pricing page. Fees are billed in advance on a monthly or annual
              basis and are non-refundable except as required by law or as described in our refund policy.
            </p>
            <p>
              We reserve the right to change our pricing with at least 30 days&apos; notice. Your continued use of
              the paid Service after a price change constitutes acceptance of the new pricing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">7. Termination</h2>
            <p>
              You may cancel your account at any time through your account settings or by contacting us.
              We may suspend or terminate your access if you violate these Terms, with or without prior notice
              depending on the severity of the violation.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. We will retain your data
              for 30 days after account closure, after which it will be permanently deleted.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">8. Intellectual property</h2>
            <p>
              The Service and its original content (excluding Your Content), features, and functionality are
              and will remain the exclusive property of Invokix. Our trademarks, logo, and brand features
              may not be used without our prior written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">9. Disclaimer of warranties</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind,
              either express or implied. We do not warrant that the Service will be uninterrupted, error-free,
              or completely secure. Your use of the Service is at your sole risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">10. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Invokix shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data, or
              goodwill, arising out of or in connection with your use of or inability to use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">11. Governing law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India, without regard
              to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the
              courts located in India.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">12. Changes to terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email
              or via a prominent notice on our website at least 14 days before the changes take effect. Your
              continued use of the Service after the effective date constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">13. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:hello@invokix.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                hello@invokix.com
              </a>.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-6">
          <Link href="/privacy" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy Policy →</Link>
          <Link href="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">About →</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
