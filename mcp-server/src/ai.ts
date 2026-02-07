import Anthropic from "@anthropic-ai/sdk";

const USE_ANTHROPIC = process.env.ANTHROPIC_API_KEY ? true : false;

const anthropic = USE_ANTHROPIC
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

/**
 * Analyze patterns with AI
 */
export async function analyzeWithAI(prompt: string): Promise<string> {
  if (USE_ANTHROPIC && anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }
    } catch (error: any) {
      console.error("AI error:", error.message);
      return fallbackAnalysis();
    }
  }

  return fallbackAnalysis();
}

/**
 * Simple fallback if no AI available
 */
function fallbackAnalysis(): string {
  return JSON.stringify([
    {
      type: "sequence",
      description: "Regular activity pattern detected",
      actions: ["Transfer", "Receive", "Transfer"],
      confidence: 0.6,
      occurrences: 3,
    },
  ]);
}