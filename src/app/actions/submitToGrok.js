"use server";

// import { deductToken } from "@/lib/deduct-token";
import { SYSTEM_PROMPT } from "@/lib/prompt";
// import { createClient } from "@/lib/supabase/server";

// Helper function for retries with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3, initialBackoff = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const status = response.status;
        if ([429, 502, 503].includes(status) && attempt < maxRetries - 1) {
          // Exponential backoff: wait 1s, then 2s, then 4s, etc.
          const backoffTime = initialBackoff * Math.pow(2, attempt);
          console.warn(`API error ${status} - Retrying after ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message ||
          `API request failed with status ${status}`
        );
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        throw err; // Rethrow after all retries fail
      }
      // Backoff on network errors too
      const backoffTime = initialBackoff * Math.pow(2, attempt);
      console.error(`Network error - Retrying after ${backoffTime}ms:`, err);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
}

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
    const response = await fetchWithRetry("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4-fast-reasoning", // Confirm this model is available in your tier
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.9,
        max_tokens: 1024,
        stream: false,
      }),
    });

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content received from Grok API.");
    }
    return aiContent;
  } catch (err) {
    console.error("Grok API error:", err);
    throw err; // Rethrow to handle in client (e.g., show a user-friendly message)
  }
}