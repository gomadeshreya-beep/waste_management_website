import axios from "axios";

export const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Free hosting may put the backend to sleep. Auth pages call this on entry
// and wait for the API to wake before enabling account actions.
export const wakeBackend = () => API.get("/health", { timeout: 90000 });

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("cleanlane-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const verifyEmail = (token) => API.get("/verify", { params: { token } });
export const resendVerificationEmail = (email) => API.post("/resend-verification", { email });
export const getAdminApprovalRequest = (token) => API.get("/admin-approval", { params: { token } });
export const decideAdminRegistration = (token, decision) => API.post("/admin-approval", { token, decision });
export const reportIssue = (formData) => API.post("/reports", formData);
export const getActiveReports = () => API.get("/reports/active");
export const getResolvedReports = () => API.get("/reports/resolved");
export const getAdminReports = () => API.get("/reports/admin");
export const resolveReport = (reportId) => API.post(`/reports/${encodeURIComponent(reportId)}/resolve`);
export const deleteReport = (reportId) => API.delete(`/reports/${encodeURIComponent(reportId)}`);
export const getStats = async () => {
  const [active, resolved] = await Promise.all([getActiveReports(), getResolvedReports()]);
  return { total: active.data.length + resolved.data.length, active: active.data.length, resolved: resolved.data.length };
};

export default API;
