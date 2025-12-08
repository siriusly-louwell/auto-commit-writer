import { readFileSync } from "fs";
import { resolve } from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function loadPrompt(name: string): string {
  const file = resolve(__dirname, "..", "prompts", `${name}.prompt.txt`);
  return readFileSync(file, "utf8");
}

export async function generateCommitMessage(diff: string): Promise<string> {
  if (!GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY in environment variables");
  }

  const template = loadPrompt("commit.prompt");
  const content = template.replace("{{diff}}", diff);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "You write clean, concise commit messages.",
                  content
                ].join("\n\n")
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const message =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

  if (!message)
    throw new Error("Failed to generate commit message: empty response from Google API");

  return message.trim();
}
