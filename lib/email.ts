import nodemailer from 'nodemailer';
import { config } from './config';

const emailFrom = config.emailFrom;
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = config.smtpHost;
  const smtpPort = config.smtpPort;
  const smtpUser = config.smtpUser;
  const smtpPass = config.smtpPass;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailFrom) {
    throw new Error('SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM must be defined');
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

function wrapHtmlTemplate({ title, heading, body, ctaText, ctaUrl, footerNote }: {
  title: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  footerNote: string;
}) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f7f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f7f7;padding:32px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfe9ea;">
                <tr>
                  <td style="padding:28px 32px 18px;background:linear-gradient(135deg,#0b7a75,#0ea5a4);color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size:28px;font-weight:700;letter-spacing:-0.04em;">Tether Link</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 18px;">
                    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a;letter-spacing:-0.04em;">${heading}</h1>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#475569;">${body}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px;">
                      <tr>
                        <td align="center" bgcolor="#0ea5a4" style="border-radius:999px;">
                          <a href="${ctaUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;letter-spacing:0.02em;color:#ffffff;text-decoration:none;border-radius:999px;">${ctaText}</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#475569;">If the button does not work, copy and paste this link into your browser:</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;word-break:break-all;color:#0f172a;background:#f8fafc;padding:12px 14px;border-radius:10px;border:1px solid #e2e8f0;">${ctaUrl}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 28px;">
                    <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">${footerNote}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const plainText = `Welcome to Tether Link!\n\n` +
    `Your verification token:\n\n` +
    `${token}\n\n` +
    `Please enter this token to verify your email address.\n\n` +
    `Thank you!`;

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f7f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f7f7;padding:32px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfe9ea;">
                <tr>
                  <td style="padding:28px 32px 18px;background:linear-gradient(135deg,#0b7a75,#0ea5a4);color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size:28px;font-weight:700;letter-spacing:-0.04em;">Tether Link</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 18px;">
                    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a;letter-spacing:-0.04em;">Verify your email address</h1>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;">Welcome to Tether Link. Please use the verification token below to complete your account setup:</p>
                    
                    <div style="background:#f8fafc;padding:20px;border-radius:10px;border:2px solid #0ea5a4;margin:24px 0;text-align:center;">
                      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Your Verification Token</p>
                      <p style="margin:0;font-size:24px;font-weight:700;color:#0f172a;font-family:monospace;letter-spacing:2px;word-break:break-all;">${token}</p>
                    </div>
                    
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#475569;">Then visit the verification page to complete your email verification.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 28px;">
                    <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">If you did not create this account, you can safely ignore this email.</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: emailFrom,
    to: email,
    subject: 'Verify your email for Tether Link',
    text: plainText,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${config.nextAuthUrl}/app/password-reset?token=${encodeURIComponent(token)}`;
  const plainText = `Reset your password\n\n` +
    `Reset your password by visiting the link below:\n\n` +
    `${resetUrl}\n\n` +
    `If the link does not work, paste this token into the password reset page:\n${token}\n\n` +
    `This link is valid for one hour. If you did not request a reset, please ignore this message.`;

  const html = wrapHtmlTemplate({
    title: 'Reset your password',
    heading: 'Reset your password',
    body: 'You recently requested to reset your password. Click the button below to choose a new password and continue securely.',
    ctaText: 'Reset my password',
    ctaUrl: resetUrl,
    footerNote: 'This link is valid for one hour. If you did not request a password reset, you can ignore this message.',
  });

  await getTransporter().sendMail({
    from: emailFrom,
    to: email,
    subject: 'Password reset request',
    text: plainText,
    html,
  });
}
