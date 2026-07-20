import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_MODE } from "@/lib/free-mode";
import { consumePaidUse } from "@/lib/usage";
import { FREE_PROMPT as FIGURE_FREE_PROMPT } from "@/lib/prompts/figure-free";
import { PAID_PROMPT as FIGURE_PAID_PROMPT } from "@/lib/prompts/figure-paid";
import { createXai } from "@ai-sdk/xai";
import { generateText } from "ai";

// Public Figure "complicity check". Researches documented CONDUCT and TIES
// (funding, investments, statements, votes, Epstein network) — never identity,
// ethnicity, or religion. See the prompt files for the enforced scope.

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, image, mimeType } = body;

    if (!name && !image) {
      return NextResponse.json({ error: "Name or image required" }, { status: 400 });
    }

    // Identity from Supabase Auth (the one session cookie); entitlement from
    // user_metadata.plan via the shared usage gate.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Figure research is a paid-only feature. Free/guest users hit the paywall
    // client-side and never reach a real xAI call — enforce that here too so
    // unauthenticated callers can't burn credits. FREE_MODE bypasses billing.
    let paid = FREE_MODE;
    if (!FREE_MODE) {
      if (!user?.id) {
        return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
      }
      const { allowed } = await consumePaidUse(user.id);
      if (!allowed) {
        return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
      }
      paid = true;
    }

    const systemPrompt = paid ? FIGURE_PAID_PROMPT : FIGURE_FREE_PROMPT;
    const maxTokens = paid ? 1500 : 400;

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    let userContent;
    if (image && paid) {
      userContent = [
        {
          type: "text",
          text: "Identify each public figure visible in this image and research each for DOCUMENTED conduct and ties relevant to Israel's occupation (funding, investments, business operations, public support, votes) and to Jeffrey Epstein's network. Never report ethnicity, religion, or heritage. Return a JSON array where each element follows the standard result structure.",
        },
        {
          type: "image",
          image: `data:${mimeType || "image/jpeg"};base64,${image}`,
        },
      ];
    } else {
      userContent = `Research the public figure named "${name}".`;
    }

    const xai = createXai({ apiKey });

    const aiResult = await generateText({
      model: xai.responses("grok-4-1-fast-reasoning"),
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
      temperature: 0.2,
      maxOutputTokens: maxTokens,
      tools: {
        web_search: xai.tools.webSearch(),
        x_search: xai.tools.xSearch(),
      },
    });

    const aiContent = aiResult.text;
    const citations = (aiResult.sources || [])
      .filter((s) => s.sourceType === "url" && s.url)
      .map((s) => s.url);

    if (!aiContent) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let result;
    try {
      const cleaned = aiContent
        .replace(/^```(?:json)?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { short_result: aiContent, accuracy: 50, sources: [] };
    }

    // Replace any model-produced URLs with the real citations from tool calls.
    if (citations.length > 0) {
      result.sources = citations.slice(0, paid ? 15 : 3);
    }

    return NextResponse.json({ result, paid });
  } catch (err) {
    console.error("Research error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
