// app/layout.tsx
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invokix.com"

export const viewport: Viewport = {
  themeColor: "#080A0F",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Invokix — API Contract Platform, Mock Servers & Breaking Change Gate",
    template: "%s | Invokix",
  },
  description:
    "Design, mock, generate SDKs, and prevent breaking changes. Protect your entire API contract lifecycle in one unified developer platform.",
  applicationName: "Invokix",
  authors: [{ name: "Invokix", url: baseUrl }],
  generator: "Next.js",
  keywords: [
    "Invokix",
    "API Contract",
    "OpenAPI",
    "Swagger",
    "Mock Server",
    "API Mocking",
    "Breaking Change Detection",
    "TypeScript SDK Generator",
    "API Governance",
    "API Testing",
    "Contract Testing",
    "Microservices API",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Invokix",
  publisher: "Invokix",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Invokix",
    title: "Invokix — API Contract Platform, Mock Servers & Breaking Change Gate",
    description:
      "Design, mock, generate SDKs, and prevent breaking changes. Protect your entire API contract lifecycle in one unified developer platform.",
    images: [
      {
        url: "/og-banner.png",
        width: 1734,
        height: 907,
        alt: "Invokix — The API Contract Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invokix — API Contract Platform, Mock Servers & Breaking Change Gate",
    description:
      "Design, mock, generate SDKs, and prevent breaking changes. Protect your entire API contract lifecycle in one unified developer platform.",
    images: ["/og-banner.png"],
    creator: "@invokix",
    site: "@invokix",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Invokix",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: ["https://twitter.com/invokix", "https://github.com/invokix"],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Invokix",
      description: "Design, generate, sync and protect your entire API contract in one place.",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Invokix",
      operatingSystem: "All",
      applicationCategory: "DeveloperApplication",
      description:
        "Developer platform to design API contracts, spin up instant mock servers, generate typed SDKs, and prevent breaking changes.",
      url: baseUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}