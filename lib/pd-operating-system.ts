/**
 * PD OPERATING SYSTEM
 *
 * Layer 1: Philosophy (Never Changes)
 *
 * This is the immutable foundation.
 * Every decision in layers below must comply with these rules.
 *
 * If a layer produces output that violates these rules, it fails validation.
 */

export const PDOperatingSystem = {
  /**
   * CORE PRINCIPLE
   * Maximum Psychology ÷ Minimum Words
   *
   * Not: How few words can we use?
   * But: How much psychological work does each word do?
   */
  core: "Maximum Psychology ÷ Minimum Words",

  /**
   * RULE 1: PERMISSION BEFORE PERSUASION
   *
   * Never attempt to convince someone they need something.
   * First, give them permission to ignore you.
   *
   * This removes sales defensiveness before engagement exists.
   */
  permissionBeforePersuasion: {
    principle:
      "Give permission to ignore before requesting attention",
    why: "Removes resistance that hasn't formed yet",
    example: "If this has never been an issue, feel free to ignore this.",
  },

  /**
   * RULE 2: OBSERVATION BEFORE EXPLANATION
   *
   * Never explain what you do.
   * Show what they experience.
   *
   * Observation proves understanding.
   * Explanation creates skepticism.
   */
  observationBeforeExplanation: {
    principle: "Show reality. Never explain products.",
    why: "Observable facts persuade better than claims",
    example: "Your main courier hits capacity on Thursdays.",
    antiExample: "We provide overflow courier capacity.",
  },

  /**
   * RULE 3: EVIDENCE OVER ASSERTION
   *
   * Every claim must be supported by evidence visible to the reader.
   * If you can't show evidence, don't make the claim.
   *
   * Bad: "We understand logistics"
   * Good: "We noticed many teams only discover courier issues after
   *        customers start chasing orders"
   */
  evidenceOverAssertion: {
    principle: "Every claim must carry visible evidence",
    why: "Claims invite skepticism. Evidence invites agreement.",
    test: "Can the reader see the evidence themselves?",
    example: "We worked with 12 London facilities companies. Not because we're cheapest, but because we show up when logistics gets messy.",
  },

  /**
   * RULE 4: RESPECT BEFORE ATTENTION
   *
   * Never chase attention.
   * Never demand it.
   * Earn it by showing respect first.
   *
   * Respect means: acknowledging they might not need you.
   * Respect means: honoring their time.
   * Respect means: removing pressure.
   */
  respectBeforeAttention: {
    principle: "Honor the reader before asking for engagement",
    why: "Respect opens conversation. Pressure closes it.",
    example: "If you've never had to scramble for backup delivery, this won't be relevant.",
  },

  /**
   * RULE 5: READER PERSUADES THEMSELVES
   *
   * The strongest belief is the one they generate themselves.
   *
   * Your job: Create conditions where they reach conclusions naturally.
   * Your job: Never state conclusions for them.
   */
  readerPersuadesThemselves: {
    principle: "Don't convince. Create conditions for self-conviction.",
    why: "Self-generated conclusions are stronger than external persuasion",
    how: "Ask questions. Show observations. Let them draw conclusions.",
  },

  /**
   * RULE 6: EVERY SENTENCE EARNS ITS EXISTENCE
   *
   * Assume every sentence is unnecessary until proven otherwise.
   *
   * For each sentence ask:
   * "What psychological value disappears if this sentence is removed?"
   *
   * If the answer is "almost nothing," delete it.
   */
  everySentenceEarnsItsExistence: {
    principle: "Deletion principle: Guilty until proven necessary",
    why: "Compression amplifies impact",
    rule: "If a sentence performs only one function, rewrite or delete it",
  },

  /**
   * RULE 7: TRUST BEFORE CLEVERNESS
   *
   * Claude naturally favors clever writing.
   * Humans trust obvious truths.
   *
   * When forced to choose: Choose obvious.
   *
   * Clever: "The fastest way to improve logistics might be doing nothing."
   * Obvious: "If deliveries are already consistent, you probably don't need us."
   *
   * Obvious wins.
   */
  trustBeforeCleverRness: {
    principle: "Choose obvious truths over clever observations",
    why: "Humans trust obvious. Cleverness creates distance.",
    rule: "When in doubt, make the statement simpler and more direct",
    example: "Choose: 'Thursday your courier is full' over 'Capacity constraints emerge mid-week'",
  },

  /**
   * RULE 8: NEVER MANUFACTURE TRUST SIGNALS. REVEAL REAL ONES.
   *
   * This is the most important rule.
   *
   * A trust signal is NOT a tactic to deploy.
   * A trust signal is the natural consequence of honest reasoning.
   *
   * Example of manufactured (bad):
   * "I'm not trying to convince you" (inserted to signal restraint)
   *
   * Example of revealed (good):
   * "If the prospect genuinely doesn't need your solution, say so"
   * (This emerges from honest analysis, not inserted as tactic)
   *
   * The difference:
   * - Manufactured signals: Claude learned to sprinkle them in
   * - Revealed signals: They emerge naturally from context
   *
   * Rule:
   * If there isn't a truthful reason to say something, don't say it.
   * If the prospect genuinely doesn't need your solution, say so—because it's true.
   * If changing suppliers would genuinely make no sense today, say so—because it's true.
   * If there's no honest basis for a statement, don't use it.
   */
  neverManufactureTrustSignals: {
    principle: "Trust signals emerge from honest reasoning, not insertion",
    why: "Manufactured signals feel inauthentic over time. Real ones are durable.",
    rule: "Only state a trust signal if it's genuinely true in this context",
    danger: "If Claude learns to sprinkle in 'ignore this' because framework says it works, the system becomes another formula people can sense",
    safeguard: "Every trust signal must pass: 'Is this genuinely true for this prospect?'",
  },

  /**
   * RULE 9: SOUND LIKE A HUMAN, NOT A WRITER
   *
   * Never sound like:
   * - Marketing
   * - Sales
   * - Copywriting
   * - Persuasion attempt
   *
   * Always sound like:
   * - Genuine observation
   * - Respectful interruption
   * - Thoughtful note
   * - Human conversation
   */
  soundLikeAHuman: {
    principle: "Write like you're talking to a peer",
    why: "Humans connect with humans. They distrust formulas.",
    rule: "If it sounds like it was written, rewrite it",
  },

  /**
   * VALIDATION QUESTIONS
   *
   * Use these to audit every output from Layers 2 and 3.
   * If ANY answer is no, the output fails.
   */
  validationQuestions: [
    "Does this respect the reader's intelligence?",
    "Is this based on observable facts?",
    "Would an executive believe this?",
    "Does this sound like marketing? (If yes: FAIL)",
    "Is every claim supported by visible evidence?",
    "Would we still send this if they never bought?",
    "Is there a truthful basis for every statement?",
    "Does this help before it asks?",
    "Could this have been said more simply?",
    "Does restraint appear naturally—not inserted?",
  ],
};

/**
 * Layer 1 is immutable.
 * It does not change based on industry, stage, or context.
 * Layers 2 and 3 must comply with these rules always.
 */
export type PDOperatingSystem = typeof PDOperatingSystem;
