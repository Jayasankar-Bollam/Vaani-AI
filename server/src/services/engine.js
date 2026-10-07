const LEVELS = ["Easy", "Medium", "Hard"];

export function updateSkill(skills, skill, score10) {
  const old = skills[skill] ?? 5;
  skills[skill] = +(0.7 * old + 0.3 * score10).toFixed(2);
}

export function nextDifficulty(current, recentScores) {
  const last2 = recentScores.slice(-2);
  let i = LEVELS.indexOf(current);
  if (last2.length === 2 && last2.every((s) => s >= 7)) i = Math.min(i + 1, 2);
  if (last2.length === 2 && last2.every((s) => s <= 4)) i = Math.max(i - 1, 0);
  return LEVELS[i];
}

export function decideNext({ evaluation, lastQuestion, skills, askedTopics, difficulty }) {
  // 1. Big claim made -> verify it
  if (evaluation.claims.length > 0 && !lastQuestion.isVerification) {
    return {
      mode: "verify_claim",
      topic: lastQuestion.topic,
      claim: evaluation.claims[0],
      difficulty,
      reason: "Candidate made a claim worth verifying",
    };
  }
  // 2. Weak answer -> fundamentals on same topic
  if (evaluation.overall_score <= 4) {
    return {
      mode: "fundamentals",
      topic: lastQuestion.topic,
      difficulty: "Easy",
      reason: "Weak answer, checking basics",
    };
  }
  // 3. Strong answer -> go deeper
  if (evaluation.overall_score >= 8) {
    return {
      mode: "go_deeper",
      topic: lastQuestion.topic,
      difficulty,
      reason: "Strong answer, testing scale and edge cases",
    };
  }
  // 4. Otherwise test the weakest skill not asked about yet
  const target =
    Object.entries(skills)
      .filter(([s]) => !askedTopics.includes(s))
      .sort((a, b) => a[1] - b[1])[0]?.[0] ?? lastQuestion.topic;
  return {
    mode: "new_topic",
    topic: target,
    difficulty,
    reason: `Weakest untested skill: ${target}`,
  };
}