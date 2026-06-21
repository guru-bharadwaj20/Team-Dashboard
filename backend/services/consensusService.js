/**
 * Consensus Engine
 *
 * Automatically resolves a proposal when:
 *   - ≥ AGREE_THRESHOLD of votes are "agree"
 *   - ≥ PARTICIPATION_THRESHOLD of team members have voted
 *
 * Returns { reached, agreePercentage, participationRate } without side effects.
 * Side effects (save, notify, emit) are handled by the calling controller.
 */

const AGREE_THRESHOLD = 0.70;        // 70% agreement required
const PARTICIPATION_THRESHOLD = 0.50; // at least 50% of members must vote

/**
 * Pure calculation — no DB access, no mutations.
 * @param {Array} votes - proposal.votes array
 * @param {number} memberCount - team.members.length
 * @returns {{ reached: boolean, agreePercentage: number, participationRate: number, totalVotes: number }}
 */
export const evaluateConsensus = (votes, memberCount) => {
  if (!votes || votes.length === 0) {
    return { reached: false, agreePercentage: 0, participationRate: 0, totalVotes: 0 };
  }

  const totalVotes = votes.length;
  const agreeCount = votes.filter((v) => v.vote === 'agree').length;

  const agreePercentage = (agreeCount / totalVotes) * 100;
  const participationRate = memberCount > 0 ? (totalVotes / memberCount) * 100 : 0;

  const reached =
    agreePercentage >= AGREE_THRESHOLD * 100 &&
    participationRate >= PARTICIPATION_THRESHOLD * 100;

  return { reached, agreePercentage, participationRate, totalVotes };
};

export const CONSENSUS_THRESHOLDS = {
  AGREE_THRESHOLD,
  PARTICIPATION_THRESHOLD,
};
