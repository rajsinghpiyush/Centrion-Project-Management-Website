import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const BRAND = {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    accent: '#3B82F6',
    dark: '#0F172A',
    text: '#334155',
    muted: '#94A3B8',
    light: '#F8FAFC',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
};

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centrion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent}); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: white; font-size: 22px; font-weight: 700; line-height: 44px;">✦</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 24px; font-weight: 800; color: ${BRAND.dark}; letter-spacing: -0.5px;">Centrion</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
                ${content}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.muted};">
                © ${new Date().getFullYear()} Centrion. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createTransporter = async () => {
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        } catch (err) {
            console.error('Failed to create Ethereal test account', err);
        }
    }
};

const sendEmail = async (options) => {
    if (!transporter) await createTransporter();
    const message = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Centrion Support'}" <${process.env.EMAIL_FROM || 'noreply@centrion.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };
    try {
        const info = await transporter.sendMail(message);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('📧 [EMAIL ERROR]', error);
        return { success: false, error: error.message };
    }
};

export const sendVerificationEmail = async ({ email, name, verificationToken }) => {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const content = `
    <tr>
      <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%); padding: 48px 40px; text-align: center;">
        <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 800;">Verify Your Email</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.dark}; font-weight: 600;">Hi ${name} 👋</p>
        <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.text}; line-height: 1.6;">
          Welcome to Centrion! Please verify your email address.
        </p>
        <a href="${verificationUrl}" style="display: inline-block; background: ${BRAND.primary}; color: #FFFFFF; padding: 14px 40px; text-decoration: none; border-radius: 12px;">Verify Email</a>
      </td>
    </tr>
  `;
    return sendEmail({ to: email, subject: 'Verify Your Email - Centrion', html: emailWrapper(content) });
};

export const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const content = `
    <tr><td style="padding: 40px;"><h2>Reset Password</h2><p>Click below to reset your password:</p><a href="${resetUrl}">Reset Password</a></td></tr>
  `;
    return sendEmail({ to: email, subject: 'Reset Your Password - Centrion', html: emailWrapper(content) });
};

export const sendWelcomeEmail = async ({ email, name }) => {
    const content = `
    <tr><td style="padding: 40px;"><h2>Welcome, ${name}!</h2><p>Thanks for joining Centrion.</p></td></tr>
  `;
    return sendEmail({ to: email, subject: 'Welcome to Centrion!', html: emailWrapper(content) });
};
