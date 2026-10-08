import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import { getActiveReports, getResolvedReports, reportIssue } from "../services/api";
import "../styles/theme.css";

function Dashboard() {
  const navigate = useNavigate();
  const [activeReports, setActiveReports] = useState([]);
  const [resolvedReports, setResolvedReports] = useState([]);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [tab, setTab] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("cleanlane-user") || "{}"); }
    catch { return {}; }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [active, resolved] = await Promise.all([getActiveReports(), getResolvedReports()]);
      setActiveReports(active.data);
      setResolvedReports(resolved.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("cleanlane-token");
        sessionStorage.removeItem("cleanlane-user");
        navigate("/login");
      } else setError(err.response?.data?.error || "Could not load reports. Check that the server is running.");
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (!sessionStorage.getItem("cleanlane-token")) { navigate("/login"); return; }
    loadReports();
  }, [loadReports, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    if (!photo) { setError("Please attach a photo of the waste issue."); return; }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("area", area.trim());
    formData.append("location", location.trim());
    formData.append("description", description.trim());
    formData.append("photo", photo);
    setSubmitting(true);
    try {
      await reportIssue(formData);
      setTitle(""); setArea(""); setLocation(""); setDescription(""); setPhoto(null);
      form.reset();
      setTab("active");
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit the report. Please try again.");
    } finally { setSubmitting(false); }
  };

  const signOut = () => {
    sessionStorage.removeItem("cleanlane-token");
    sessionStorage.removeItem("cleanlane-user");
    navigate("/");
  };
  const reports = tab === "active" ? activeReports : resolvedReports;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-brand">♻ CleanNeighbour</p>
          <h1>Hello{user.name ? `, ${user.name}` : " there"}!</h1>
          <p className="dashboard-subtitle">Help keep your neighbourhood clean and safe.</p>
        </div>
        <div className="dashboard-header-actions"><Link className="dashboard-home-link" to="/">Home</Link><button className="dashboard-home-link" type="button" onClick={signOut}>Log out</button></div>
      </header>

      <section className="dashboard-stats" aria-label="Report summary">
        <div className="dashboard-stat"><span className="stat-icon">📍</span><div><p>Issues being handled</p><strong>{activeReports.length}</strong></div></div>
        <div className="dashboard-stat"><span className="stat-icon resolved-icon">✓</span><div><p>Issues resolved</p><strong>{resolvedReports.length}</strong></div></div>
      </section>

      <section className="dashboard-submit">
        <div className="dashboard-section-heading"><div><p className="dashboard-kicker">HELP YOUR COMMUNITY</p><h2>Report a waste issue</h2><p>Share a photo and location so the local team can find it.</p></div><span className="submit-emoji" aria-hidden="true">🌱</span></div>
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <input type="text" aria-label="Short title" placeholder="Short title (e.g. Waste dumped near park)" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          <input type="text" aria-label="Area or neighbourhood" placeholder="Area / neighbourhood" value={area} onChange={(e) => setArea(e.target.value)} required maxLength={120} />
          <input type="text" aria-label="Specific location" placeholder="Street or landmark" value={location} onChange={(e) => setLocation(e.target.value)} required maxLength={240} />
          <textarea aria-label="Issue details" placeholder="Describe what you saw (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
          <label className="dashboard-file">Photo of the issue<input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} required /></label>
          <button type="submit" disabled={submitting}>{submitting ? "Sending report…" : "Submit report"}</button>
        </form>
        {error && <p className="dashboard-error" role="alert">{error}</p>}
      </section>

      <section className="dashboard-list-section">
        <div className="dashboard-tabs" role="tablist" aria-label="Community reports">
          <button className={`dashboard-tab ${tab === "active" ? "selected" : ""}`} type="button" role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")}>Active reports <span>{activeReports.length}</span></button>
          <button className={`dashboard-tab ${tab === "resolved" ? "selected" : ""}`} type="button" role="tab" aria-selected={tab === "resolved"} onClick={() => setTab("resolved")}>Resolved <span>{resolvedReports.length}</span></button>
        </div>
        {loading ? <p className="dashboard-empty">Loading reports…</p> : reports.length === 0 ? (
          <div className="dashboard-empty"><span>{tab === "active" ? "🌿" : "✅"}</span><strong>{tab === "active" ? "No active reports yet" : "No resolved reports yet"}</strong><p>{tab === "active" ? "New community reports will appear here." : "Resolved issues will appear here so everyone can see the progress."}</p></div>
        ) : <div className="dashboard-report-list">{reports.map((report) => <ReportCard key={report._id} report={report} />)}</div>}
      </section>
    </main>
  );
}

export default Dashboard;
