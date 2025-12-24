import nodemailer, { Transporter } from 'nodemailer';
import sgMail from '@sendgrid/mail';
// @ts-ignore
import pug from 'pug';
// @ts-ignore
import { convert } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface IUser {
  email: string;
  fullName: string;
}

export default class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.fullName.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_USER || '';
  }

  // Gmail transport (fallback)
  private newTransport(): Transporter {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send via SendGrid
  async sendViaSendGrid(template: string, subject: string): Promise<void> {
    try {
      const apiKey = (process.env.SENDGRID_API_KEY || '').trim();
      if (!apiKey) throw new Error('SENDGRID_API_KEY not set');
      sgMail.setApiKey(apiKey);

      const fromEmail = (
        process.env.SENDGRID_FROM_EMAIL ||
        process.env.EMAIL_USER ||
        ''
      ).trim();
      const fromName = (
        process.env.SENDGRID_FROM_NAME ||
        process.env.FROM_NAME ||
        'SaveOurVotes'
      ).trim();
      if (!fromEmail)
        throw new Error(
          'SendGrid sender email not configured (SENDGRID_FROM_EMAIL or EMAIL_USER)'
        );

      const templatePath = join(__dirname, '../Views', `${template}.pug`);
      const html = pug.renderFile(templatePath, {
        fullName: this.firstName,
        url: this.url,
        subject,
        verificationUrl: this.url,
        logoUrl: process.env.LOGO_URL,
        supportEmail: process.env.SUPPORT_EMAIL,
      });

      const msg = {
        to: this.to,
        from: { email: fromEmail, name: fromName },
        subject,
        html,
        text: convert(html, { wordwrap: 130 }),
      };

      await sgMail.send(msg);
      console.log(`Email sent via SendGrid to ${this.to}`);
    } catch (error) {
      const err = error as any;
      console.error(
        'SendGrid error:',
        err.response?.body || err.message || error
      );
      throw error;
    }
  }

  // Send via Gmail (fallback)
  async sendViaGmail(template: string, subject: string): Promise<void> {
    try {
      const templatePath = join(__dirname, '../Views', `${template}.pug`);
      const html = pug.renderFile(templatePath, {
        fullName: this.firstName,
        url: this.url,
        subject,
        verificationUrl: this.url,
        logoUrl: process.env.LOGO_URL,
        supportEmail: process.env.SUPPORT_EMAIL,
      });

      const mailOptions = {
        from: `SaveOurVotes <${this.from}>`,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 130 }),
      };

      await this.newTransport().sendMail(mailOptions);
      console.log(`Email sent via Gmail to ${this.to}`);
    } catch (error) {
      console.error('Gmail error:', error);
      throw new Error('Failed to send email via Gmail');
    }
  }

  // Smart send - tries SendGrid first, falls back to Gmail
  async send(template: string, subject: string): Promise<void> {
    try {
      if (process.env.SENDGRID_API_KEY) {
        await this.sendViaSendGrid(template, subject);
      } else {
        await this.sendViaGmail(template, subject);
      }
    } catch (error) {
      console.log('SendGrid failed, trying Gmail fallback...');
      await this.sendViaGmail(template, subject);
    }
  }

  async sendWelcome(): Promise<void> {
    await this.send(
      'verificationEmail',
      'Welcome to SaveOurVotes - Verify Your Email'
    );
  }
}
