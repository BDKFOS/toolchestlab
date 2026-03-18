import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const { name = "", email = "", message = "" } = req.body || {};

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ message: "Please fill out all fields." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ message: "Missing RESEND_API_KEY." });
    }

    if (!toEmail) {
      return res.status(500).json({ message: "Missing CONTACT_TO_EMAIL." });
    }

    const { data, error } = await resend.emails.send({
      from: "ToolChestLab Contact <contact@send.toolchestlab.com>",
      to: [toEmail],
      subject: `New ToolChestLab contact form message from ${cleanName}`,
      replyTo: cleanEmail,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>New ToolChestLab contact form message</h2>
          <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; background: #fafafa; border: 1px solid #ececec; padding: 16px; border-radius: 8px;">
            ${escapeHtml(cleanMessage)}
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ message: "Email service error. Please try again." });
    }

    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}
