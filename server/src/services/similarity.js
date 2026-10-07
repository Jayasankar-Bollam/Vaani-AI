export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const normalize = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

export function checkDuplicate(newQ, newEmbedding, asked) {
  for (const q of asked) {
    if (normalize(q.text) === normalize(newQ)) return "exact";
    if (q.embedding?.length && cosine(newEmbedding, q.embedding) >= 0.8) return "semantic";
  }
  return "ok";
}