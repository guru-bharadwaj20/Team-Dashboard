/**
 * AI Decision Summarization — Google Gemini
 *
 * Gracefully degrades: if GEMINI_API_KEY is absent or the API call fails,
 * the caller receives null and the system continues normally.
 */

let genAI = null;

// Lazy-initialize to avoid crashing at startup when key is missing
const getClient = () => {
  if (genAI) return genAI;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    // Dynamic import to avoid load-time crash when package may not be installed
    const { GoogleGenerativeAI } = await import('@google/generative-ai').catch(() => ({ GoogleGenerativeAI: null }));
    if (!GoogleGenerativeAI) return null;
    genAI = new GoogleGenerativeAI(key);
    return genAI;
  } catch {
    return null;
  }
};

// Lazy-init helper that handles the async nature of dynamic import
let _clientPromise = null;
const getClientAsync = async () => {
  if (_clientPromise) return _clientPromise;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const mod = await import('@google/generative-ai');
    genAI = new mod.GoogleGenerativeAI(key);
    return genAI;
  } catch {
    return null;
  }
};

/**
 * Generate a structured decision summary for a resolved proposal.
 *
 * @param {Object} proposal - Mongoose proposal document (with .toObject())
 * @returns {Object|null} summary object or null on failure
 */
export const generateSummary = async (proposal) => {
  // Never regenerate if one already exists
  if (proposal.aiSummary?.generatedAt) return proposal.aiSummary;

  const client = await getClientAsync();
  if (!client) {
    console.log('[AI] GEMINI_API_KEY not set — skipping summary generation');
    return null;
  }

  try {
    const votes = proposal.votes || [];
    const agree = votes.filter((v) => v.vote === 'agree').length;
    const disagree = votes.filter((v) => v.vote === 'disagree').length;
    const neutral = votes.filter((v) => v.vote === 'neutral').length;
    const totalVotes = votes.length;

    const commentTexts = (proposal.comments || [])
      .slice(-10) // Last 10 comments for context
      .map((c) => `- ${c.text}`)
      .join('\n') || 'No comments were submitted.';

    const optionsList = (proposal.options || []).map((o) => `• ${o.text}`).join('\n') || 'No specific options listed.';

    const prompt = `You are a senior decision analyst. Summarize this team decision.

Title: ${proposal.title}
Description: ${proposal.description || 'No description provided.'}
Options considered:
${optionsList}

Vote results:
- Agree: ${agree} (${totalVotes > 0 ? Math.round((agree/totalVotes)*100) : 0}%)
- Disagree: ${disagree} (${totalVotes > 0 ? Math.round((disagree/totalVotes)*100) : 0}%)
- Neutral: ${neutral} (${totalVotes > 0 ? Math.round((neutral/totalVotes)*100) : 0}%)
- Total votes: ${totalVotes}

Team discussion highlights:
${commentTexts}

Respond ONLY with valid JSON in this exact schema:
{
  "executiveSummary": "2-3 sentences summarizing the proposal and its outcome",
  "supportingArguments": ["argument 1", "argument 2", "argument 3"],
  "opposingArguments": ["concern 1", "concern 2"],
  "outcome": "One sentence stating the final decision",
  "nextAction": "One concrete recommended next step for the team"
}`;

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from possible markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      executiveSummary: parsed.executiveSummary || '',
      supportingArguments: Array.isArray(parsed.supportingArguments) ? parsed.supportingArguments : [],
      opposingArguments: Array.isArray(parsed.opposingArguments) ? parsed.opposingArguments : [],
      outcome: parsed.outcome || '',
      nextAction: parsed.nextAction || '',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[AI] Summary generation failed:', err.message);
    return null;
  }
};
