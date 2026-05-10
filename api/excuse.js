export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { context, style, tone } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You write short, natural excuses. If the requested style is believable, make it realistic and usable. If the requested style is funny, make it amusing but still coherent."
          },
          {
            role: "user",
            content: `Write a ${style}, ${tone} excuse for this situation: ${context}`
          }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.message || "OpenAI API error"
      });
    }

    return res.status(200).json({
      message: data.choices[0].message.content
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
}
