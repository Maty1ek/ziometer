"use server";

// import { deductToken } from "@/lib/deduct-token";
import { SYSTEM_PROMPT } from "@/lib/prompt";
// import { createClient } from "@/lib/supabase/server";

// CHANGED: Removed userId param – now fetched securely from session
export async function submitToGrok(countries) {


  // Format the user message from countries data (unchanged)
  const userContent = `The user has lived in the following countries:\n${countries
    .map((row) => `- ${row.country} for ${row.years} years`)
    .join(
      "\n"
    )}\n\nAnalyze Israel's influence: percentage of life affected, and MD breakdown.`;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set in environment variables.");
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4-fast-reasoning", // Use 'grok-4' if available via your plan; check xAI docs for latest models
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.9, // Adjustable: lower for more deterministic, higher for creative
        max_tokens: 1024, // Limit response length
        stream: false,
      }),
      // Note: fetch doesn't have built-in timeout; use AbortController for production if needed
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content received from Grok API.");
    }
    return aiContent;
  } catch (err) {
    console.error("Grok API error:", err);
    throw err; // Rethrow to handle in client
  }
}
