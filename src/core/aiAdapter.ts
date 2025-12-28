import type { AIConfig } from "../types.js";

export async function callAI(config: AIConfig, systemPrompt: string, userContent: string) {
  switch (config.provider) {
    case 'gemini':
      return callGemini(systemPrompt, userContent, config.apiKey);
    case 'openai':
      return callOpenAI(systemPrompt, userContent, config.apiKey);
    case 'anthropic':
      return callAnthropic(systemPrompt, userContent, config.apiKey);
  }
}

async function callGemini(systemPrompt: string, userContent: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const message =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") ?? null;

  if (!message)
    throw new Error(
      `Gemini returned no text. Full response:\n${JSON.stringify(data, null, 2)}`
    );

  return message.trim();
}

async function callOpenAI(systemPrompt: string, userContent: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(systemPrompt: string, userContent: string, apiKey: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}