/**
 * AI Decision Summarization — Google Gemini
 *
 * Gracefully degrades: if GEMINI_API_KEY is absent or the API call fails,
 * the caller receives null and the system continues normally.
 */

let genAI = null;

/**
 * Lazily initialize Gemini client.
 */
const getClientAsync = async () => {
  if (genAI) return genAI;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }

  try {
    const { GoogleGenerativeAI } = await import(
      "@google/generative-ai"
    );

    genAI = new GoogleGenerativeAI(key);

    return genAI;
  } catch (err) {
    console.error("[AI] Failed to initialize Gemini:", err.message);
    return null;
  }
};

/**
 * Generate a structured decision summary for a resolved proposal.
 *
 * @param {Object} proposal
 * @returns {Object|null}
 */
export const generateSummary = async (proposal) => {
  // Don't regenerate existing summaries
  if (proposal.aiSummary?.generatedAt) {
    return proposal.aiSummary;
  }

  const client = await getClientAsync();

  if (!client) {
    console.log(
      "[AI] GEMINI_API_KEY missing or Gemini unavailable — skipping summary generation."
    );
    return null;
  }

  try {
    const votes = proposal.votes || [];

    const agree = votes.filter((v) => v.vote === "agree").length;
    const disagree = votes.filter((v) => v.vote === "disagree").length;
    const neutral = votes.filter((v) => v.vote === "neutral").length;
    const totalVotes = votes.length;

    const commentTexts =
      (proposal.comments || [])
        .slice(-10)
        .map((c) => `- ${c.text}`)
        .join("\n") || "No comments submitted.";

    const optionsList =
      (proposal.options || [])
        .map((o) => `• ${o.text}`)
        .join("\n") || "No options specified.";

    const prompt = `
You are a senior decision analyst.

Summarize the following resolved proposal.

Title:
${proposal.title}

Description:
${proposal.description || "No description."}

Options:
${optionsList}

Votes:

Agree: ${agree}
Disagree: ${disagree}
Neutral: ${neutral}
Total: ${totalVotes}

Recent comments:

${commentTexts}

Return ONLY valid JSON.

{
  "executiveSummary": "...",
  "supportingArguments": [
    "...",
    "..."
  ],
  "opposingArguments": [
    "...",
    "..."
  ],
  "outcome": "...",
  "nextAction": "..."
}
`;

    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Gemini did not return valid JSON.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      executiveSummary: parsed.executiveSummary || "",

      supportingArguments: Array.isArray(
        parsed.supportingArguments
      )
        ? parsed.supportingArguments
        : [],

      opposingArguments: Array.isArray(
        parsed.opposingArguments
      )
        ? parsed.opposingArguments
        : [],

      outcome: parsed.outcome || "",

      nextAction: parsed.nextAction || "",

      generatedAt: new Date(),
    };
  } catch (err) {
    console.error(
      "[AI] Summary generation failed:",
      err.message
    );

    return null;
  }
};