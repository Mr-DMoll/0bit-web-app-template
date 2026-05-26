import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.SENDER_EMAIL || "noreply@example.com";
const APP    = process.env.APP_NAME     || "My App";

// ── Invite email ───────────────────────────────────────────────────────────────

export async function sendInviteEmail(
  to: string, inviteLink: string, name: string
) {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: `You've been invited to ${APP}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2>Welcome to ${APP}</h2>
        <p>Hi ${name},</p>
        <p>You've been invited to join ${APP}. Click the button below to set your password and activate your account.</p>
        <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#84cc16;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">
          Accept Invitation
        </a>
        <p style="color:#666;font-size:13px">This link expires in 7 days. If you didn't expect this email, you can ignore it.</p>
      </div>
    `,
  });
}

// ── Verification email ─────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string, verifyLink: string
) {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Verify your ${APP} account`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#84cc16;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">
          Verify Email
        </a>
      </div>
    `,
  });
}

// ── Password reset email ───────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string, resetLink: string
) {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Reset your ${APP} password`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#84cc16;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// ── Verification code email ────────────────────────────────────────────────────

export async function sendVerificationCodeEmail(
  to: string, code: string
) {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Your ${APP} verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2>Your verification code</h2>
        <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;background:#f1f5f9;padding:16px;border-radius:8px;text-align:center">
          ${code}
        </p>
        <p style="color:#666;font-size:13px">This code expires in 15 minutes.</p>
      </div>
    `,
  });
}