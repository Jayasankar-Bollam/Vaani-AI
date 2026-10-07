import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { getInterview } from "../api.js";

const LEVEL = { Easy: 1, Medium: 2, Hard: 3 };

export default function DashboardPage() {
  const { id } = useParams();
  const [iv, setIv] = useState(null);

  useEffect(() => { getInterview(id).then(setIv); }, [id]);
  if (!iv) return <p>Loading...</p>;

  const scores = iv.answers.map((a) => a.evaluation.overall_score);
  const avg = scores.length ? (scores.reduce((s, x) => s + x, 0) / scores.length).toFixed(1) : 0;
  const report = iv.report;

  const skillData = Object.entries(iv.skillScores).map(([skill, value]) => ({ skill, value }));
  const areaData = report ? Object.entries(report.areas).map(([area, value]) => ({ area, value })) : [];
  const diffData = iv.difficultyHistory.map((d, i) => ({ step: i + 1, level: LEVEL[d] }));
  const done = iv.status === "completed";

  return (
    <div>
      <div className="card hero">
        <div>
          <p className="muted">Overall Readiness</p>
          <div className="big">{report ? `${report.overall}%` : "In progress"}</div>
          {report && <span className="badge rec">{report.recommendation}</span>}
        </div>
        <div>
          <p className="muted">Questions completed</p>
          <div className="big">{iv.answers.length}/10</div>
        </div>
        <div>
          <p className="muted">Average score</p>
          <div className="big">{avg}/10</div>
        </div>
      </div>

      <div className="charts">
        <div className="card">
          <h3>Skill scores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={skillData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar dataKey="value" fill="#6366f1" fillOpacity={0.5} stroke="#6366f1" />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {report && (
          <div className="card">
            <h3>Category scores (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h3>Difficulty progression</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={diffData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis domain={[1, 3]} ticks={[1, 2, 3]}
                tickFormatter={(v) => ["", "Easy", "Medium", "Hard"][v]} />
              <Tooltip formatter={(v) => ["", "Easy", "Medium", "Hard"][v]} />
              <Line type="stepAfter" dataKey="level" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {report && (
        <div className="lists">
          <div className="card"><h3>Strengths</h3><ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div className="card"><h3>Areas for improvement</h3><ul>{report.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div className="card"><h3>Recommended learning</h3><ul>{report.recommended_learning.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </div>
      )}

      {!done && <Link to={`/interview/${id}`}><button>Continue interview</button></Link>}
      <Link to="/"><button className="secondary">New interview</button></Link>
    </div>
  );
}