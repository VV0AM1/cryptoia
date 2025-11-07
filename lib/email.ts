import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@yourdomain.com';
const APP_NAME = process.env.APP_NAME || 'Your App';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP credentials not set — emails will fail to send.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, 
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  const html = verificationHtmlTemplate({ name, verifyUrl });

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Verify your email`,
    html,
  });
}

export async function sendOtpEmail(email: string, code: string) {
  const html = otpHtmlTemplate({ code });
  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `Your one-time code`,
    html,
  });
}

function verificationHtmlTemplate({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Verify your email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial; background:#F6F7FB; margin:0; padding:32px;}
      .card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 6px 30px rgba(18,20,24,0.06); }
      .logo { height: 40px; }
      .btn { display:inline-block; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600; }
      .primary { background: #2563eb; color: white; }
      .muted { color:#6b7280; }
      .code { font-size:18px; font-weight:700; letter-spacing:2px; background:#f3f4f6; padding:8px 12px; border-radius:6px; display:inline-block; }
    </style>
  </head>
  <body>
    <div class="card">
      <img src="${process.env.APP_LOGO_URL || 'https://via.placeholder.com/150x40?text=LOGO'}" alt="Logo" class="logo"/>
      <h2>Hi ${name || 'there'},</h2>
      <p class="muted">Thanks for creating an account. Click the button below to verify your email and finish registration.</p>
      <p style="text-align:center;">
        <a href="${verifyUrl}" class="btn primary">Verify your email</a>
      </p>
      <p class="muted">If the button doesn't work, paste this link in your browser:</p>
      <p class="muted"><small>${verifyUrl}</small></p>
      <hr/>
      <p class="muted">If you didn't request this, you can ignore this email.</p>
    </div>
  </body>
  </html>
  `;
}

function otpHtmlTemplate({ code }: { code: string }) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Your OTP code</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial; background:#F6F7FB; margin:0; padding:32px;}
      .card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 6px 30px rgba(18,20,24,0.06); }
      .code { font-size:28px; font-weight:800; letter-spacing:4px; background:#f3f4f6; padding:12px 18px; border-radius:10px; display:inline-block; }
      .muted { color:#6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <img src="${process.env.APP_LOGO_URL || 'https://via.placeholder.com/150x40?text=LOGO'}" alt="Logo" style="height:40px"/>
      <h2>Your one-time code</h2>
      <p class="muted">Use the code below to finish signing in. The code expires in 10 minutes.</p>
      <p style="text-align:center;"><span class="code">${code}</span></p>
      <hr/>
      <p class="muted">If you did not request this code, ignore this email.</p>
    </div>
  </body>
  </html>
  `;
}