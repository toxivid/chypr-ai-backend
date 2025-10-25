import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key not set' });

  try {
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
    const reply = data?.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
