import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return Response.json(
        { message: "Please fill out all fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (name.length > 120 || email.length > 200 || message.length > 5000) {
      return Response.json(
        { message: "Your message is too long." },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!toEmail) {
      return Response.json(
        { message: "Contact email is not configured." },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "ToolChestLab Contact <contact@send.toolchestlab.com>",
      to: [toEmail],
      reply_to: email,
      subject: `New ToolChestLab contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>New ToolChestLab contact form message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; background: #fafafa; border: 1px solid #ececec; padding: 16px; border-radius: 8px;">
            ${escapeHtml(message)}
          </div>
        </div>
      `
    });

    if (error) {
      return Response.json(
        { message: "Email service error. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
