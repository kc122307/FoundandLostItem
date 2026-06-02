import nodemailer from 'nodemailer';
import { log } from '../config/logger.js';

export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `LostLink <${process.env.SMTP_FROM || 'noreply@lostlink.app'}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
    log('info', `Email sent to ${options.email}`);
  } catch (error) {
    log('error', `Failed to send email to ${options.email}`, { error: error.message });
  }
};
