import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export async function sendEmail({ to, subject, html, text }) {
  return getTransporter().sendMail({
    from: `"NirogCare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendRegistrationOtpEmail({ to, name, otp }) {
  const safeName = escapeHtml(name);
  const clientUrl = process.env.CLIENT_URL?.trim();
  let signInLink = "";
  if (clientUrl) {
    const parsedClientUrl = new URL(clientUrl);
    if (
      !["http:", "https:"].includes(parsedClientUrl.protocol) ||
      (process.env.NODE_ENV === "production" && parsedClientUrl.protocol !== "https:")
    ) {
      throw new Error("CLIENT_URL must use HTTPS in production");
    }
    parsedClientUrl.pathname = "/auth";
    parsedClientUrl.search = "";
    parsedClientUrl.hash = "";
    signInLink = parsedClientUrl.toString();
  }
  const signInLinkHtml = signInLink
    ? `<p><a href="${escapeHtml(signInLink)}" style="color:#047857;font-weight:600">Open NirogCare sign in</a> after entering your code.</p>`
    : "";
  const html = `
    <div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="padding:24px 32px;background:#064e3b;color:#fff">
          <div style="font-size:22px;font-weight:700">NirogCare</div>
          <div style="margin-top:6px;color:#a7f3d0;font-size:14px">Your health, our care</div>
        </div>
        <div style="padding:32px">
          <p style="margin-top:0">Hello ${safeName},</p>
          <p>Use this verification code to finish creating your NirogCare account:</p>
          <div style="margin:24px 0;padding:16px;text-align:center;background:#ecfdf5;border-radius:12px;color:#047857;font-size:32px;font-weight:700;letter-spacing:8px">${otp}</div>
          <p>This code expires in <strong>5 minutes</strong>. If you did not request it, you can safely ignore this email. Never share your code with anyone, including NirogCare staff.</p>
          ${signInLinkHtml}
          <p style="margin-bottom:0;color:#64748b;font-size:13px">This is an automated security message from NirogCare.</p>
        </div>
      </div>
    </div>`;

  return sendEmail({
    to,
    subject: "Verify your NirogCare email",
    html,
    text: `Hello ${name}, your NirogCare verification code is ${otp}. It expires in 5 minutes. Never share this code with anyone.`,
  });
}
