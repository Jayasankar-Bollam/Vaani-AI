import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/interview"
});

export const startInterview = (profile) =>
  api.post("/start", profile).then((r) => r.data);

export const sendAnswer = (id, answer) =>
  api.post(`/${id}/answer`, { answer }).then((r) => r.data);

export const getInterview = (id) =>
  api.get(`/${id}`).then((r) => r.data);