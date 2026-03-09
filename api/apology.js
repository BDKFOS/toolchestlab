export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { context, tone } = req.body;

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
            content: "You write clear, natural, thoughtful apology messages. Keep them concise but human."
          },
          {
            role: "user",
            content: `Write a ${tone} apology message for this situation: ${context}`
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ message: "OpenAI response error" });
    }

    return res.status(200).json({
      message: data.choices[0].message.content
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
