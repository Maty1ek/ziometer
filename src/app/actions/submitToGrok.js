"use server";

import { SYSTEM_PROMPT } from "@/lib/prompt";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabaseServer"; // Import server client for token ops

export async function submitToGrok(countries, userId) {
  const supabase = await createClient();

  // Verify user and tokens
  const { data: tokenRow, error: profileError } = await supabase
    .from("user_tokens")
    .select("tokens")
    .eq("user_id", userId)
    .single();

  if (profileError)
    throw new Error(`Token fetch error: ${profileError.message}`);
  const tokens = tokenData?.tokens ?? 0;
  if (tokens < 1) throw new Error("Insufficient tokens – 1 token required");

  // Added userId param – required for token check/deduct
  // Error check: Validate input countries
  if (!Array.isArray(countries) || countries.length === 0) {
    throw new Error("Invalid countries input – must be a non-empty array");
  }

  // Format the user message from countries data (unchanged)
  const userContent = `The user has lived in the following countries:\n${countries
    .map((row) => `- ${row.country} for ${row.years} years`)
    .join(
      "\n"
    )}\n\nAnalyze Israel's influence: percentage of life affected, and MD breakdown.`;

  // Token check before API call (new – server-side validation)
  // const { data: tokenData, error: tokenError } = await supabase
  //   .from('user_tokens')
  //   .select('tokens')
  //   .eq('user_id', userId)
  //   .single();
  // if (tokenError) throw new Error(`Token fetch error: ${tokenError.message}`);
  // const tokens = tokenData?.tokens ?? 0;
  // if (tokens < 1) throw new Error("Insufficient tokens – 1 token required");

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
        temperature: 0.7, // Adjustable: lower for more deterministic, higher for creative
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

    // Token deduction after successful API call (new – server-side update)
    const { error: updateError } = await supabase
      .from("user_tokens")
      .update({ tokens: tokenRow.tokens - 1 })
      .eq("user_id", userId);

    if (updateError) throw new Error("Failed to deduct token");

    return aiContent;
  } catch (err) {
    console.error("Grok API error:", err);
    throw err; // Rethrow to handle in client
  }
}
