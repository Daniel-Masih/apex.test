const GOVAI_URL = "https://ca.govai.com/api/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOVAI_API_KEY;
  const model = process.env.GOVAI_MODEL;

  if (!apiKey || !model) {
    return res.status(500).json({
      error: "Missing GOVAI_API_KEY or GOVAI_MODEL environment variable."
    });
  }

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "A non-empty messages array is required." });
  }

  const safeMessages = messages
    .filter((message) =>
      message &&
      ["system", "user", "assistant"].includes(message.role) &&
      typeof message.content === "string"
    )
    .slice(-20)
    .map(({ role, content }) => ({ role, content: content.slice(0, 12000) }));

  try {
    const govaiResponse = await fetch(GOVAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        model,
        messages: safeMessages,
        stream: false,
        max_completion_tokens: 1000
      })
    });

    const raw = await govaiResponse.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    if (!govaiResponse.ok) {
      console.error("GovAI error:", govaiResponse.status, data);
      return res.status(govaiResponse.status).json({
        error: "GovAI request failed.",
        status: govaiResponse.status,
        details: data
      });
    }

    const assistantMessage = extractAssistantMessage(data);

    if (!assistantMessage) {
      console.error("Unrecognized GovAI response:", data);
      return res.status(502).json({
        error: "GovAI returned an unexpected response shape.",
        details: data
      });
    }

    return res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error("GovAI network error:", error);
    return res.status(502).json({ error: "Could not reach GovAI." });
  }
}

function extractAssistantMessage(data) {
  if (typeof data === "string" && data.trim()) return data.trim();

  return (
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.message?.content ||
    data?.message ||
    data?.content ||
    data?.response ||
    null
  );
}
