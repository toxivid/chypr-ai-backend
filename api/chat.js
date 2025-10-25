import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API key not set' });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Chypr AI — a helpful assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 600,
        temperature: 0.2
      })
    });

    const data = await response.json();

    // If OpenAI API returned an error
    if (!response.ok) {
      return res.status(response.status).json({
        error: data,
        message: `OpenAI API returned status ${response.status}`
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Backend error:", err);

    // Send detailed error back to frontend for debugging
    res.status(500).json({
      error: err.message || err.toString(),
      stack: err.stack || "No stack trace",
      message: "Server encountered an error"
    });
  }
}
