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

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ message: "Missing RESEND_API_KEY." });
    }

    if (!process.env.CONTACT_TO_EMAIL) {
      return res.status(500).json({ message: "Missing CONTACT_TO_EMAIL." });
    }

    const { data, error } = await resend.emails.send({
      from: "ToolChestLab Contact <contact@send.toolchestlab.com>",
      to: [process.env.CONTACT_TO_EMAIL],
      subject: `New ToolChestLab contact form message from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`
    });

    if (error) {
      console.error("RESEND ERROR FULL:", JSON.stringify(error, null, 2));
      return res.status(500).json({
        message: error.message || "Email failed"
      });
    }

    return res.status(200).json({
      ok: true,
      id: data?.id || null
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error. Please try again."
    });
  }
}
