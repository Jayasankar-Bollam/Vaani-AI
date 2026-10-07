import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage.jsx";
import InterviewPage from "./pages/InterviewPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

export default function App() {
  return (
    <div className="container">
      <h1 className="logo">VAANI™</h1>
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/interview/:id" element={<InterviewPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}