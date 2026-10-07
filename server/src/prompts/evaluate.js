export const evaluatePrompt = (q, answer, candidate) => `
You are a strict technical interviewer. Score the answer from 0 to 10.
Candidate: ${candidate.targetRole}, skills: ${candidate.skills.join(", ")}
Question: ${q.text}
Answer: ${answer}

Also list any specific claims in the answer (numbers, accuracy, scale, "I built X").
Return ONLY JSON with these keys:
overall_score, technical_accuracy, relevance, communication, clarity, depth,
strengths (array), weaknesses (array), claims (array), follow_up_required (boolean).`;