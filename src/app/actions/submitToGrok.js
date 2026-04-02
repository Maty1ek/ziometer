"use server";

import { SYSTEM_PROMPT_FREE } from "@/lib/prompt-free";
import { SYSTEM_PROMPT_PAID } from "@/lib/prompt-paid";
import { isPaidPlan } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

function clampPercentage(value, fieldName, allowNull = false) {
  if (allowNull && (value === null || value === undefined || value === "")) {
    return null;
  }

  const parsed =
    typeof value === "string"
      ? Number.parseFloat(value.replace("%", "").trim())
      : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid AI ${fieldName} value.`);
  }

  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function extractJsonCandidate(rawContent = "") {
  const trimmed = rawContent.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (withoutFences.startsWith("{") && withoutFences.endsWith("}")) {
    return withoutFences;
  }

  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return withoutFences.slice(firstBrace, lastBrace + 1);
  }

  return withoutFences;
}

function decodeModelString(value = "") {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function parseLooseAiResponse(rawContent) {
  const jsonCandidate = extractJsonCandidate(rawContent);
  const percentageMatch = jsonCandidate.match(
    /"percentage"\s*:\s*"?([0-9]+(?:\.[0-9]+)?%?)"?/i
  );
  const accuracyMatch = jsonCandidate.match(
    /"accuracy"\s*:\s*"?([0-9]+(?:\.[0-9]+)?%?)"?/i
  );
  const breakdownMatch =
    jsonCandidate.match(
      /"breakdownMD"\s*:\s*"([\s\S]*?)"\s*,\s*"accuracy"/i
    ) ??
    jsonCandidate.match(/"breakdownMD"\s*:\s*"([\s\S]*?)"\s*\}/i);

  if (!percentageMatch || !breakdownMatch) {
    throw new Error("AI response could not be recovered.");
  }

  return {
    percentage: clampPercentage(percentageMatch[1], "percentage"),
    breakdownMD: decodeModelString(breakdownMatch[1]),
    accuracy: accuracyMatch
      ? clampPercentage(accuracyMatch[1], "accuracy", true)
      : null,
  };
}

function normalizeAiResponse(rawContent) {
  const jsonCandidate = extractJsonCandidate(rawContent);
  let parsedResponse;

  try {
    parsedResponse = JSON.parse(jsonCandidate);
  } catch {
    return parseLooseAiResponse(rawContent);
  }

  return {
    percentage: clampPercentage(parsedResponse?.percentage, "percentage"),
    breakdownMD:
      typeof parsedResponse?.breakdownMD === "string"
        ? parsedResponse.breakdownMD
        : "",
    accuracy: clampPercentage(parsedResponse?.accuracy, "accuracy", true),
  };
}

export async function submitToGrok(countries) {
  if (!Array.isArray(countries) || countries.length === 0) {
    throw new Error("Invalid countries input – must be a non-empty array");
  }

  const userContent = `The user has lived in the following countries:\n${countries
    .map((row) => `- ${row.country} for ${row.years} years`)
    .join(
      "\n"
    )}\n\nAnalyze Israel's influence: percentage of life affected, and MD breakdown. Return only a valid JSON object.`;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set in environment variables.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const systemPrompt = isPaidPlan(user?.user_metadata?.plan)
    ? SYSTEM_PROMPT_PAID
    : SYSTEM_PROMPT_FREE;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 5524, // Limit response length
        stream: false,
      }),
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          responseText ||
          `API request failed with status ${response.status}`
      );
    }

    if (!data) {
      throw new Error("Invalid response received from Grok API.");
    }

    const aiContent = data.choices?.[0]?.message?.content;
    const normalizedContent = Array.isArray(aiContent)
      ? aiContent
          .map((part) => (typeof part?.text === "string" ? part.text : ""))
          .join("")
      : String(aiContent ?? "");

    if (!normalizedContent) {
      throw new Error("No content received from Grok API.");
    }

    try {
      return normalizeAiResponse(normalizedContent);
    } catch {
      console.error("Unreadable Grok response:", normalizedContent);
      throw new Error("The AI returned an unreadable response. Please try again.");
    }
  } catch (err) {
    console.error("Grok API error:", err);
    throw err; // Rethrow to handle in client (e.g., show a user-friendly message)
  }
}