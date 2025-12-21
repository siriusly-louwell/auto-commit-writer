import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const __dirname = resolve(fileURLToPath(import.meta.url), "..");

function loadPrompt(name: string): string {
  const file = resolve(__dirname, "..", "prompts", `${name}.prompt.txt`);
  return readFileSync(file, "utf8");
}

export async function generateCommitMessage(diff: string, promptType: "commit" | "changelog" | "pr" = "commit"): Promise<string> {
  if (!GOOGLE_API_KEY)
    throw new Error("Missing GOOGLE_API_KEY in environment variables");

  const template = loadPrompt("commit");
  const content = template.replace("{{diff}}", diff);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const message =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") ?? null;

  if (!message) {
    throw new Error(
      `Gemini returned no text. Full response:\n${JSON.stringify(data, null, 2)}`
    );
  }

  return message.trim();
}
