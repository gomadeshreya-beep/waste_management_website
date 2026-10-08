import axios from "axios";

export const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("cleanlane-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const reportIssue = (formData) => API.post("/reports", formData);
export const getActiveReports = () => API.get("/reports/active");
export const getResolvedReports = () => API.get("/reports/resolved");
export const getStats = async () => {
  const [active, resolved] = await Promise.all([getActiveReports(), getResolvedReports()]);
  return { total: active.data.length + resolved.data.length, active: active.data.length, resolved: resolved.data.length };
};

export default API;
