import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview } from "../api.js";

export default function ProfilePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", degree: "B.Tech", branch: "CSE", year: "3rd Year",
    targetCompany: "", targetRole: "Associate Software Engineer",
    skills: "", experience: "",
  });
  const [projects, setProjects] = useState([{ title: "", description: "" }]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setProject = (i, k, v) =>
    setProjects(projects.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        projects: projects.filter((p) => p.title.trim()),
      };
      const data = await startInterview(payload);
      nav(`/interview/${data.id}`);
    } catch (err) {
      setError("Could not start the interview. Is the server running?");
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Candidate Profile</h2>
      <div className="grid">
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input placeholder="Degree" value={form.degree} onChange={set("degree")} />
        <input placeholder="Branch" value={form.branch} onChange={set("branch")} />
        <input placeholder="Year" value={form.year} onChange={set("year")} />
        <input placeholder="Target company" value={form.targetCompany} onChange={set("targetCompany")} />
        <input placeholder="Target role" value={form.targetRole} onChange={set("targetRole")} />
      </div>
      <input
        placeholder="Skills (comma separated) e.g. Python, Machine Learning, SQL, React"
        value={form.skills} onChange={set("skills")} required
      />
      <h3>Projects</h3>
      {projects.map((p, i) => (
        <div className="project" key={i}>
          <input placeholder="Project title" value={p.title} onChange={(e) => setProject(i, "title", e.target.value)} />
          <textarea placeholder="What did you build, and how?" rows={3}
            value={p.description} onChange={(e) => setProject(i, "description", e.target.value)} />
        </div>
      ))}
      <button type="button" className="secondary" onClick={() => setProjects([...projects, { title: "", description: "" }])}>
        + Add project
      </button>
      <textarea placeholder="Internship / experience (optional)" rows={2}
        value={form.experience} onChange={set("experience")} />
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? "Preparing your interview..." : "Start Interview"}</button>
    </form>
  );
}