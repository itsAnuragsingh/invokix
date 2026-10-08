// lib/notify/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.FROM_EMAIL ?? 'InvoKix <noreply@invokix.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export type InviteEmailParams = {
  to: string
  inviterName?: string | null
  projectName: string
  role?: string | null
  token: string
}

export async function sendInviteEmail({
  to,
  inviterName,
  projectName,
  role = "editor",
  token,
}: InviteEmailParams): Promise<void> {
  const inviteUrl = `${APP_URL}/invite/${token}`
  const inviter = inviterName?.trim() || "A Teammate"
  const roleLabel =
    role === "editor"
      ? "Editor"
      : role === "viewer"
      ? "Viewer"
      : role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Developer"

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviter} invited you to join ${projectName} on Invokix`,
    html: `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>You've been invited to join ${projectName} on Invokix</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css" />
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
    
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif !important;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .font-heading {
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif !important;
    }
    .font-body {
      font-family: 'Inter', Arial, Helvetica, sans-serif !important;
    }

    @media only screen and (max-width: 600px) {
      .mobile-outer {
        padding: 0 !important;
      }
      .mobile-card {
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-content {
        padding: 28px 20px 32px 20px !important;
      }
      .mobile-header {
        padding: 16px 20px 14px 20px !important;
      }
      .mobile-meta-td {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-top: 10px !important;
        padding-bottom: 10px !important;
      }
      .mobile-meta-divider {
        display: none !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, h1, span, strong {
      font-family: Arial, Helvetica, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#F5F4EF; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Outer Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="mobile-outer" style="background-color:#F5F4EF; padding:24px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">
    <tr>
      <td align="center">
        <!-- Main Card Container: max-width 580px -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="mobile-card" style="max-width:580px; width:100%; margin:0 auto; background-color:#FFFFFF; border-radius:18px; overflow:hidden; border:1px solid #EBE9E1; box-shadow:0 4px 24px rgba(0,0,0,0.03);">

          <!-- Top Brand Header with Team Invite Badge -->
          <tr>
            <td class="mobile-header" style="padding:20px 28px; background-color:#FFFFFF; border-bottom:1px solid #F1F5F9;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle; line-height:0;">
                          <img src="https://invokix.com/logo.png" alt="Invokix" width="28" height="28" style="display:inline-block; vertical-align:middle; width:28px; height:28px; border-radius:6px; object-fit:cover;" />
                        </td>
                        <td style="vertical-align:middle; padding-left:10px;">
                          <span class="font-heading" style="font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:22px; font-weight:800; color:#2563EB; letter-spacing:-0.5px; line-height:28px; display:inline-block;">
                            Invokix
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-family:'SF Mono', Menlo, Consolas, 'Plus Jakarta Sans', monospace, sans-serif; font-size:11px; font-weight:700; color:#94A3B8; letter-spacing:1.5px; text-transform:uppercase;">
                      TEAM INVITE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Hero Banner Image (public/invite.png) -->
          <tr>
            <td style="padding:0; margin:0; line-height:0; background-color:#B7FF3C;">
              <img src="https://ik.imagekit.io/itsanurag/invokix/invite.png" alt="The Team's Waiting - You've Been Invited" width="580" style="display:block; width:100%; max-width:580px; height:auto; border:0; outline:none;" />
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="mobile-content" style="padding:36px 32px 32px 32px; background-color:#FFFFFF;">

              <!-- Main Heading -->
              <h1 class="font-heading" style="margin:0 0 16px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:32px; font-weight:900; letter-spacing:-0.8px; color:#0F172A; line-height:1.15; text-transform:uppercase;">
                YOUR NEXT API<br />COLLABORATION STARTS HERE.
              </h1>

              <!-- Description -->
              <p class="font-body" style="margin:0 0 28px 0; font-family:'Inter', Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#475569; font-weight:400;">
                You&rsquo;ve been invited to join <strong style="color:#0F172A; font-weight:700;">${projectName}</strong> on Invokix.<br />
                Collaborate on API contracts, track changes, and stay aligned with the people building alongside you.
              </p>

              <!-- Primary CTA Button (Join the Team) -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 34px 0;">
                <tr>
                  <td align="left" style="border-radius:8px; background-color:#0F172A; background-image:linear-gradient(#0F172A, #0F172A); box-shadow:0 4px 12px rgba(15,23,42,0.18);">
                    <a href="${inviteUrl}" target="_blank" class="font-heading" style="display:inline-block; padding:15px 30px; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:13px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; text-decoration:none; text-align:center;">
                      JOIN THE TEAM &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3-Column Metadata Grid (Invited By, Project, Role) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E2E8F0; border-bottom:1px solid #E2E8F0; padding:18px 0; margin-bottom:22px;">
                <tr>
                  <!-- Invited By -->
                  <td width="33%" valign="top" class="mobile-meta-td" style="padding-right:12px;">
                    <p style="margin:0 0 6px 0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#64748B;">
                      INVITED BY
                    </p>
                    <p style="margin:0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:15px; font-weight:700; color:#0F172A; line-height:1.3;">
                      ${inviter}
                    </p>
                  </td>

                  <!-- Vertical Divider -->
                  <td width="1" class="mobile-meta-divider" style="background-color:#E2E8F0; width:1px; font-size:0; line-height:0; padding:0;">&nbsp;</td>

                  <!-- Project -->
                  <td width="33%" valign="top" class="mobile-meta-td" style="padding-left:14px; padding-right:12px;">
                    <p style="margin:0 0 6px 0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#64748B;">
                      PROJECT
                    </p>
                    <p style="margin:0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:15px; font-weight:700; color:#0F172A; line-height:1.3;">
                      ${projectName}
                    </p>
                  </td>

                  <!-- Vertical Divider -->
                  <td width="1" class="mobile-meta-divider" style="background-color:#E2E8F0; width:1px; font-size:0; line-height:0; padding:0;">&nbsp;</td>

                  <!-- Role -->
                  <td width="33%" valign="top" class="mobile-meta-td" style="padding-left:14px;">
                    <p style="margin:0 0 6px 0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#64748B;">
                      ROLE
                    </p>
                    <p style="margin:0; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:15px; font-weight:700; color:#0F172A; line-height:1.3;">
                      ${roleLabel}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ignore Disclaimer -->
              <p class="font-body" style="margin:0 0 28px 0; font-family:'Inter', Arial, Helvetica, sans-serif; font-size:12px; line-height:1.5; color:#94A3B8;">
                Not expecting this invite?<br />
                You can safely ignore this email.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="border-top:1px solid #E2E8F0; font-size:0; line-height:0; height:1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Bottom Tagline & Brand Lockup -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="right" style="padding-right:20px; vertical-align:middle; width:48%;">
                    <p class="font-heading" style="margin:0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:15px; font-weight:800; color:#0F172A; line-height:1.25; letter-spacing:-0.3px; text-align:left; display:inline-block; text-transform:uppercase;">
                      ONE CONTRACT.<br />EVERY TEAM.<br />IN SYNC.
                    </p>
                  </td>
                  <td width="1" style="background-color:#D1D5DB; width:1px; padding:0;"></td>
                  <td align="left" style="padding-left:20px; vertical-align:middle; width:48%;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle; line-height:0;">
                          <img src="https://invokix.com/logo.png" alt="Invokix" width="28" height="28" style="display:inline-block; vertical-align:middle; width:28px; height:28px; border-radius:6px; object-fit:cover;" />
                        </td>
                        <td style="vertical-align:middle; padding-left:10px;">
                          <span class="font-heading" style="font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:22px; font-weight:800; color:#2563EB; letter-spacing:-0.5px; line-height:28px; display:inline-block;">
                            Invokix
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <p class="font-body" style="margin:0; font-family:'Inter', Arial, Helvetica, sans-serif; font-size:11px; color:#94A3B8;">
                      You&rsquo;re receiving this email because someone invited you to join their team on Invokix.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// Convenient alias
export const sendTeamInviteEmail = sendInviteEmail

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name?: string | null
}): Promise<void> {
  const greeting = name ? `HEY ${name.toUpperCase()} 👋` : "HEY THERE 👋"

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Invokix — Your API has a home now ⚡",
    html: `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Invokix</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css" />
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif !important;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .font-heading {
      font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif !important;
    }
    .font-body {
      font-family: 'Inter', Arial, Helvetica, sans-serif !important;
    }

    @media only screen and (max-width: 600px) {
      .mobile-outer {
        padding: 0 !important;
      }
      .mobile-card {
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-content {
        padding: 24px 18px 28px 18px !important;
      }
      .mobile-header {
        padding: 16px 18px 14px 18px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, h1, span, strong {
      font-family: Arial, Helvetica, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#F5F4EF; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Outer Table with 0 horizontal padding so it fits phone screen without side gaps -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="mobile-outer" style="background-color:#F5F4EF; padding:24px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">
    <tr>
      <td align="center">
        <!-- Main Card Container: max-width 580 on desktop, 100% full-bleed on phone -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="mobile-card" style="max-width:580px; width:100%; margin:0 auto; background-color:#FFFFFF; border-radius:18px; overflow:hidden; border:1px solid #EBE9E1; box-shadow:0 4px 24px rgba(0,0,0,0.03);">

          <!-- Top Brand Header with public logo -->
          <tr>
            <td class="mobile-header" style="padding:22px 28px 18px 28px; background-color:#FFFFFF;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle; line-height:0;">
                    <img src="https://invokix.com/logo.png" alt="Invokix" width="28" height="28" style="display:inline-block; vertical-align:middle; width:28px; height:28px; border-radius:6px; object-fit:cover;" />
                  </td>
                  <td style="vertical-align:middle; padding-left:10px;">
                    <span class="font-heading" style="font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:22px; font-weight:800; color:#2563EB; letter-spacing:-0.5px; line-height:28px; display:inline-block;">
                      Invokix
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Hero Banner Image (Hosted Cloudinary URL) -->
          <tr>
            <td style="padding:0; margin:0; line-height:0; background-color:#1E1B4B;">
              <img src="https://ik.imagekit.io/itsanurag/invokix/welcome.png" alt="Your API Has A Home Now - Invokix" width="580" style="display:block; width:100%; max-width:580px; height:auto; border:0; outline:none;" />
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="mobile-content" style="padding:36px 32px 32px 32px; background-color:#FFFFFF;">

              <!-- Greeting -->
              <p class="font-heading" style="margin:0 0 10px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:12px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#111827;">
                ${greeting}
              </p>

              <!-- Main Heading -->
              <h1 class="font-heading" style="margin:0 0 16px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:36px; font-weight:800; letter-spacing:-1px; color:#111827; line-height:1.15;">
                You&rsquo;re in.
              </h1>

              <!-- Intro Paragraph -->
              <p class="font-body" style="margin:0 0 28px 0; font-family:'Inter', Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#4B5563; font-weight:400;">
                Invokix helps your team turn ideas into API contracts, understand changes, and keep everyone building from the same source of truth.
              </p>

              <!-- Primary CTA Button (Full width on mobile, vibrant blue glowing border in Dark Mode) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px 0;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:#111827; background-image:linear-gradient(#111827, #111827); border:1.5px solid #3B82F6; box-shadow:0 4px 14px rgba(37,99,235,0.25);">
                    <a href="${APP_URL}/dashboard" target="_blank" class="font-heading" style="display:block; width:100%; box-sizing:border-box; padding:16px 20px; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:13px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; text-decoration:none; text-align:center;">
                      CREATE YOUR FIRST CONTRACT &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps Section Title -->
              <p class="font-heading" style="margin:0 0 18px 0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:11px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#6B7280;">
                YOUR FIRST 3 MINUTES
              </p>

              <!-- 3 Steps Grid: linear-gradient prevents Gmail Dark Mode from inverting green into muddy olive -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; margin-bottom:34px;">
                <tr>
                  <!-- Step 01 -->
                  <td width="33%" valign="top" style="padding-right:12px; border-right:1px solid #E5E7EB;">
                    <div style="display:inline-block; background-color:#B7FF3C !important; background-image:linear-gradient(#B7FF3C, #B7FF3C) !important; padding:4px 12px; border-radius:9999px; margin-bottom:12px; border:1px solid rgba(0,0,0,0.12);">
                      <span class="font-heading" style="color:#0B0E14 !important; -webkit-text-fill-color:#0B0E14 !important; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:12px; font-weight:800; line-height:1; display:inline-block;">01</span>
                    </div>
                    <p class="font-heading" style="margin:0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:13px; font-weight:700; color:#111827; line-height:1.35;">
                      Describe your<br />API idea
                    </p>
                  </td>

                  <!-- Step 02 -->
                  <td width="33%" valign="top" style="padding-left:12px; padding-right:12px; border-right:1px solid #E5E7EB;">
                    <div style="display:inline-block; background-color:#B7FF3C !important; background-image:linear-gradient(#B7FF3C, #B7FF3C) !important; padding:4px 12px; border-radius:9999px; margin-bottom:12px; border:1px solid rgba(0,0,0,0.12);">
                      <span class="font-heading" style="color:#0B0E14 !important; -webkit-text-fill-color:#0B0E14 !important; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:12px; font-weight:800; line-height:1; display:inline-block;">02</span>
                    </div>
                    <p class="font-heading" style="margin:0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:13px; font-weight:700; color:#111827; line-height:1.35;">
                      Generate your<br />contract
                    </p>
                  </td>

                  <!-- Step 03 -->
                  <td width="33%" valign="top" style="padding-left:12px;">
                    <div style="display:inline-block; background-color:#B7FF3C !important; background-image:linear-gradient(#B7FF3C, #B7FF3C) !important; padding:4px 12px; border-radius:9999px; margin-bottom:12px; border:1px solid rgba(0,0,0,0.12);">
                      <span class="font-heading" style="color:#0B0E14 !important; -webkit-text-fill-color:#0B0E14 !important; font-family:'Plus Jakarta Sans', Arial, sans-serif; font-size:12px; font-weight:800; line-height:1; display:inline-block;">03</span>
                    </div>
                    <p class="font-heading" style="margin:0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:13px; font-weight:700; color:#111827; line-height:1.35;">
                      Publish when<br />ready
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 28px 0;">
                <tr>
                  <td style="border-top:1px solid #E5E7EB; font-size:0; line-height:0; height:1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Tagline & Brand Lockup with public logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="right" style="padding-right:20px; vertical-align:middle; width:48%;">
                    <p class="font-heading" style="margin:0; font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:15px; font-weight:800; color:#111827; line-height:1.25; letter-spacing:-0.3px; text-align:left; display:inline-block;">
                      One contract.<br />Every team.<br />In sync.
                    </p>
                  </td>
                  <td width="1" style="background-color:#D1D5DB; width:1px; padding:0;"></td>
                  <td align="left" style="padding-left:20px; vertical-align:middle; width:48%;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle; line-height:0;">
                          <img src="https://invokix.com/logo.png" alt="Invokix" width="28" height="28" style="display:inline-block; vertical-align:middle; width:28px; height:28px; border-radius:6px; object-fit:cover;" />
                        </td>
                        <td style="vertical-align:middle; padding-left:10px;">
                          <span class="font-heading" style="font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif; font-size:22px; font-weight:800; color:#2563EB; letter-spacing:-0.5px; line-height:28px; display:inline-block;">
                            Invokix
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <p class="font-body" style="margin:0 0 6px 0; font-family:'Inter', Arial, Helvetica, sans-serif; font-size:11px; color:#9CA3AF;">
                      You&rsquo;re receiving this email because you created an Invokix account.
                    </p>
                    <a href="${APP_URL}/dashboard/settings" target="_blank" class="font-body" style="font-family:'Inter', Arial, Helvetica, sans-serif; font-size:11px; color:#6B7280; text-decoration:underline;">
                      Manage preferences
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}