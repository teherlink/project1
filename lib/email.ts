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

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${config.nextAuthUrl}/verify`;
  const message = `Welcome to the fund management portal!\n\n` +
    `Please verify your email by visiting the following link:\n\n` +
    `${verifyUrl}?token=${encodeURIComponent(token)}\n\n` +
    `If the link does not work, paste this token into the verification page:\n` +
    `${token}\n\n` +
    `Thank you!`;

  await getTransporter().sendMail({
    from: emailFrom,
    to: email,
    subject: 'Verify your email for Fund Management Portal',
    text: message,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${config.nextAuthUrl}/app/reset-password`;
  const message = `Reset your password by visiting the link below:\n\n` +
    `${resetUrl}?token=${encodeURIComponent(token)}\n\n` +
    `If the link does not work, paste this token into the password reset page:\n` +
    `${token}\n\n` +
    `This link is valid for one hour. If you did not request a reset, please ignore this message.`;

  await getTransporter().sendMail({
    from: emailFrom,
    to: email,
    subject: 'Password reset request',
    text: message,
  });
}
