"use server";

import { deductToken } from "@/lib/deduct-token";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { createClient } from "@/lib/supabase/server";

// CHANGED: Removed userId param – now fetched securely from session
export async function submitToGrok(countries) {
  const supabase = await createClient();

  // NEW: Fetch authenticated user from session (ensures security and persistence)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized – no active session");
  const userId = session.user.id;

  // Verify user and tokens
  const { data: tokenRow, error: profileError } = await supabase
    .from("user_tokens")
    .select("tokens")
    .eq("user_id", userId)
    .single();

  if (profileError)
    throw new Error(`Token fetch error: ${profileError.message}`);
  const tokens = tokenRow?.tokens ?? 0;
  if (tokens < 1) throw new Error("Insufficient tokens – 1 token required");

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
        max_tokens: 2524, // Limit response length
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
    // const { error: updateError } = await supabase
    //   .from("user_tokens")
    //   .update({ tokens: tokenRow.tokens - 1 })
    //   .eq("user_id", userId);
    const { error: deductError } = await supabase.rpc("deduct_user_token", { uid: userId });
  if (deductError) throw new Error(`Insufficient tokens: ${deductError.message}`);

    // if (updateError) throw new Error("Failed to deduct token");

    return aiContent;
  } catch (err) {
    console.error("Grok API error:", err);
    throw err; // Rethrow to handle in client
  }
}
