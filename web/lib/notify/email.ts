// lib/notify/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.FROM_EMAIL ?? 'InvoKix <noreply@invokix.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function sendInviteEmail({
  to,
  inviterName,
  projectName,
  role,
  token,
}: {
  to: string
  inviterName: string
  projectName: string
  role: "editor" | "viewer"
  token: string
}): Promise<void> {
  const inviteUrl = `${APP_URL}/invite/${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} invited you to ${projectName} on Invokix`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#080A0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080A0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0F1117;border:1px solid #1e2030;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e2030;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                ⚡ Invokix
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                You've been invited
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#8b8fa8;line-height:1.6;">
                <strong style="color:#ffffff;">${inviterName}</strong> invited you to join
                <strong style="color:#ffffff;">${projectName}</strong> as a
                <strong style="color:#7c6af7;">${role}</strong>.
              </p>

              <div style="background:#13151f;border:1px solid #1e2030;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#4a4f6a;">
                  Project
                </p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">
                  ${projectName}
                </p>
                <p style="margin:4px 0 0;font-size:13px;color:#8b8fa8;">
                  Role: <span style="color:#7c6af7;font-weight:500;text-transform:capitalize;">${role}</span>
                </p>
              </div>

              <a href="${inviteUrl}"
                style="display:inline-block;background:#5b4cf5;color:#ffffff;font-size:14px;font-weight:600;
                  text-decoration:none;padding:12px 28px;border-radius:10px;letter-spacing:-0.2px;">
                Accept Invitation →
              </a>

              <p style="margin:24px 0 0;font-size:12px;color:#4a4f6a;line-height:1.6;">
                Or copy this link:<br />
                <a href="${inviteUrl}" style="color:#7c6af7;word-break:break-all;">${inviteUrl}</a>
              </p>

              <p style="margin:20px 0 0;font-size:12px;color:#4a4f6a;">
                This invite expires in 7 days. If you didn't expect this, you can ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e2030;">
              <p style="margin:0;font-size:12px;color:#4a4f6a;">
                Invokix · Your API's home ·
                <a href="${APP_URL}" style="color:#7c6af7;text-decoration:none;">invokix.com</a>
              </p>
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
              <img src="https://invokix.com/welcome.png" alt="Your API Has A Home Now - Invokix" width="580" style="display:block; width:100%; max-width:580px; height:auto; border:0; outline:none;" />
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