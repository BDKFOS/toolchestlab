export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "Missing OpenAI API key" });
    }

    const { prompt } = req.body || {};
    const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";

    if (!cleanPrompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          {
            role: "system",
            content:
              "You write clear, natural, useful text for online generator tools. Avoid sounding robotic, overly formal, or overly polished. Keep the writing practical, human, and easy to copy."
          },
          {
            role: "user",
            content: cleanPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json({
        message: data?.error?.message || "OpenAI API error"
      });
    }

    const message = data?.choices?.[0]?.message?.content?.trim();

    if (!message) {
      return res.status(500).json({
        message: "No response generated"
      });
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}
