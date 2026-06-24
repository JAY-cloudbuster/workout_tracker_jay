import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw - email failure shouldn't break the flow
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your GymTracker Pro Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; font-size: 28px; margin: 0;">💪 GymTracker Pro</h1>
        </div>
        <h2 style="color: #f8fafc; font-size: 22px;">Welcome, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for signing up. Please verify your email address to unlock all features.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        <hr style="border: 1px solid #1e293b; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">© 2024 GymTracker Pro. All rights reserved.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your GymTracker Pro Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; font-size: 28px; margin: 0;">💪 GymTracker Pro</h1>
        </div>
        <h2 style="color: #f8fafc; font-size: 22px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #1e293b; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">© 2024 GymTracker Pro. All rights reserved.</p>
      </div>
    `,
  });
};
