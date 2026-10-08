// app/robots.ts
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invokix.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/templates", "/docs", "/login", "/register", "/terms", "/privacy"],
        disallow: ["/api/", "/admin/", "/project/", "/settings/", "/cli-auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/about", "/templates", "/docs", "/terms", "/privacy"],
        disallow: ["/api/", "/admin/", "/project/", "/settings/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
