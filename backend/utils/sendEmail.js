const nodemailer = require('nodemailer');

async function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Fallback to Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function buildHtmlEmail({ title = '', preheader = '', heading = '', body = '', ctaText = '', ctaUrl = '' }) {
  const primary = process.env.EMAIL_PRIMARY_COLOR || '#0ea5a4'; // teal by default
  const accent = process.env.EMAIL_ACCENT_COLOR || '#064e3b';
  const bg = '#f3f4f6';
  const textColor = '#0f172a';

  // Simple, widely supported inline styles for email clients
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"> 
    <meta name="viewport" content="width=device-width,initial-scale=1"> 
    <title>${title}</title>
    <style>
      /* Mobile friendly */
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .content { padding: 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${bg};font-family:Arial,Helvetica,sans-serif;color:${textColor};">
    <span style="display:none!important;visibility:hidden;mso-hide:all;">${preheader}</span>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;max-width:600px;background:transparent;">
            <tr>
              <td style="text-align:left;padding:16px 24px;">
                <h1 style="margin:0;font-size:20px;color:${primary};">Teyzix Marketplace</h1>
                <p style="margin:4px 0 0;color:#475569;font-size:13px;">Connecting customers with skilled providers</p>
              </td>
            </tr>

            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.06);">
                  <tr>
                    <td class="content" style="padding:24px 32px;">
                      ${heading ? `<h2 style=\"margin:0 0 12px;color:${accent};font-size:18px;\">${heading}</h2>` : ''}
                      <div style="color:#334155;font-size:15px;line-height:1.6;">${body}</div>

                      ${ctaText && ctaUrl ? `
                        <p style=\"margin:20px 0 0;\"> 
                          <a href=\"${ctaUrl}\" style=\"background:${primary};color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;\">${ctaText}</a>
                        </p>
                      ` : ''}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:16px 24px;border-top:1px solid #eef2f6;font-size:13px;color:#64748b;">
                      <p style="margin:0;">If you have any questions, reply to this email or visit our <a href="${process.env.CLIENT_URL}" style="color:${primary};text-decoration:none;">support page</a>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;text-align:center;color:#94a3b8;font-size:12px;">
                <p style="margin:0;">Teyzix Marketplace — <span style="white-space:nowrap;">${new Date().getFullYear()}</span></p>
                <p style="margin:6px 0 0;">Teyzix Marketplace, no-reply@teyzix.com</p>
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

function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '');
}

async function sendEmail({ to, subject, text, html, template }) {
  const transporter = await createTransporter();

  // If caller provided a template object, build the themed HTML
  let finalHtml = html;
  if (!finalHtml) {
    const tpl = template || {};
    finalHtml = buildHtmlEmail({
      title: tpl.title || subject || 'Notification from Teyzix Marketplace',
      preheader: tpl.preheader || stripHtmlTags(tpl.body || text || '')?.slice(0, 120) || '',
      heading: tpl.heading || subject,
      body: tpl.body || text || '',
      ctaText: tpl.ctaText || '',
      ctaUrl: tpl.ctaUrl || '',
    });
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Teyzix Marketplace <no-reply@teyzix.com>',
    to,
    subject,
    text: text || stripHtmlTags(finalHtml).replace(/\s+/g, ' ').trim(),
    html: finalHtml,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  return { info, preview };
}

module.exports = sendEmail;
