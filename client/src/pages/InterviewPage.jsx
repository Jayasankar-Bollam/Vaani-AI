import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterview, sendAnswer } from "../api.js";

export default function InterviewPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [question, setQuestion] = useState(null);
  const [count, setCount] = useState({ answered: 0, total: 10 });
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { evaluation, nextQuestion }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id).then((iv) => {
      if (iv.status === "completed") return nav(`/dashboard/${id}`);
      setQuestion(iv.questions.at(-1));
      setCount({ answered: iv.answers.length, total: 10 });
    });
  }, [id]);

  async function submit() {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await sendAnswer(id, answer);
      setCount((c) => ({ ...c, answered: c.answered + 1 }));
      if (res.done) {
        setFeedback({ evaluation: res.evaluation, done: true });
      } else {
        setFeedback({ evaluation: res.evaluation, nextQuestion: res.question });
      }
    } catch {
      setError("Something went wrong. Please try submitting again.");
    }
    setLoading(false);
  }

  function next() {
    if (feedback.done) return nav(`/dashboard/${id}`);
    setQuestion(feedback.nextQuestion);
    setFeedback(null);
    setAnswer("");
  }

  if (!question) return <p>Loading...</p>;
  const pct = (count.answered / count.total) * 100;

  return (
    <div>
      <div className="progress"><div style={{ width: `${pct}%` }} /></div>
      <p className="muted">Question {Math.min(count.answered + 1, count.total)} of {count.total}</p>

      <div className="card">
        <div className="badges">
          <span className="badge">{question.category}</span>
          <span className="badge">{question.topic}</span>
          <span className={`badge ${question.difficulty}`}>{question.difficulty}</span>
          <span className="badge">~{question.estimatedTime} min</span>
        </div>
        <h2>{question.text}</h2>

        {!feedback && (
          <>
            <textarea rows={8} placeholder="Type your answer..." value={answer}
              onChange={(e) => setAnswer(e.target.value)} disabled={loading} />
            {error && <p className="error">{error}</p>}
            <button onClick={submit} disabled={loading}>
              {loading ? "Evaluating your answer..." : "Submit Answer"}
            </button>
          </>
        )}

        {feedback && (
          <div className="feedback">
            <h3>Score: {feedback.evaluation.overall_score}/10</h3>
            <p className="muted">
              Accuracy {feedback.evaluation.technical_accuracy} · Relevance {feedback.evaluation.relevance} ·
              Communication {feedback.evaluation.communication} · Depth {feedback.evaluation.depth}
            </p>
            <p><b>Strengths:</b> {feedback.evaluation.strengths.join("; ") || "None noted"}</p>
            <p><b>To improve:</b> {feedback.evaluation.weaknesses.join("; ") || "None noted"}</p>
            {feedback.nextQuestion && (
              <p className="muted">Why the next question: {feedback.nextQuestion.reason}</p>
            )}
            <button onClick={next}>{feedback.done ? "View my report" : "Next question"}</button>
          </div>
        )}
      </div>
    </div>
  );
}