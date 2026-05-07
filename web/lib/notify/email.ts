// lib/notify/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.FROM_EMAIL ?? 'InvoKix <onboarding@resend.dev>'
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