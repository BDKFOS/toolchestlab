export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

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
            content: "You write clear, natural, useful text for online generator tools."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8
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
      message: error.message || "Server error"
    });
  }
}
