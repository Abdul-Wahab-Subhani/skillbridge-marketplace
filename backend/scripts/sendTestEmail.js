#!/usr/bin/env node
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  const recipient = 'abdulwahabsubhani2003@gmail.com';

  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use configured SMTP (Gmail / SendGrid / Mailgun etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Fallback: Ethereal test account
    console.log('SMTP not configured in .env — using Ethereal test account.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Teyzix Marketplace <no-reply@teyzix.com>',
      to: recipient,
      subject: 'Marketplace — test email',
      text: 'This is a test email from your marketplace app.',
      html: '<p>This is a <strong>test email</strong> from your marketplace app.</p>'
    });

    console.log('Message sent:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL:', preview);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
})();
