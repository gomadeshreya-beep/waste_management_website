import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import { getActiveReports, getResolvedReports, getAdminReports, reportIssue, resolveReport, deleteReport } from "../services/api";
import "../styles/theme.css";

function requestDeviceLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("This browser does not support device location."));
  }

  return new Promise((resolve, reject) => {
    let bestFix = null;
    let watchId;
    let timeoutId;
    const finish = (callback, value) => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      window.clearTimeout(timeoutId);
      callback(value);
    };
    watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const fix = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        };
        if (!bestFix || fix.accuracy < bestFix.accuracy) bestFix = fix;
        // Keep listening for a better GPS fix instead of accepting the browser's first estimate.
        if (fix.accuracy <= 25) finish(resolve, fix);
      },
      (error) => {
        if (bestFix && error.code === error.TIMEOUT) {
          finish(resolve, bestFix);
          return;
        }
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission is blocked. Allow location access for this website, then try again."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your device could not determine its location. Turn on location services and try again."
            : "Location lookup timed out. Please try again.";
        finish(reject, new Error(message));
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
    timeoutId = window.setTimeout(() => {
      if (bestFix) {
        finish(resolve, bestFix);
      } else {
        finish(reject, new Error("Your device could not determine a location. Turn on location services and try again."));
      }
    }, 30000);
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const [activeReports, setActiveReports] = useState([]);
  const [resolvedReports, setResolvedReports] = useState([]);
  const [title, setTitle] = useState("");
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("locating");
  const [locationMessage, setLocationMessage] = useState("");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [photo, setPhoto] = useState(null);
  const [tab, setTab] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("cleanlane-user") || "{}"); }
    catch { return {}; }
  }, []);

  const updateDeviceLocation = useCallback(async () => {
    setLocationStatus("locating");
    setLocationMessage("");
    try {
      const currentLocation = await requestDeviceLocation();
      setDeviceLocation(currentLocation);
      setLocationStatus("ready");
      setLocationMessage(`Device location captured (about ${Math.round(currentLocation.accuracy)} m accuracy).`);
      return currentLocation;
    } catch (locationError) {
      setDeviceLocation(null);
      setLocationStatus("error");
      setLocationMessage(locationError.message);
      throw locationError;
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      if (user.role === "admin" || user.role === "municipal") {
        const { data } = await getAdminReports();
        setActiveReports(data.filter((report) => report.status !== "resolved"));
        setResolvedReports(data.filter((report) => report.status === "resolved"));
      } else {
        const [active, resolved] = await Promise.all([getActiveReports(), getResolvedReports()]);
        setActiveReports(active.data);
        setResolvedReports(resolved.data);
      }
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("cleanlane-token");
        sessionStorage.removeItem("cleanlane-user");
        navigate("/login");
      } else setError(err.response?.data?.error || "Could not load reports. Check that the server is running.");
    } finally { setLoading(false); }
  }, [navigate, user.role]);

  useEffect(() => {
    if (!sessionStorage.getItem("cleanlane-token")) { navigate("/login"); return; }
    loadReports();
  }, [loadReports, navigate]);

  useEffect(() => {
    if (user.role !== "admin" && user.role !== "municipal") {
      updateDeviceLocation().catch(() => {});
    }
  }, [updateDeviceLocation, user.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    if (!landmark.trim()) { setError("Please enter a nearby street or landmark."); return; }
    if (!description.trim()) { setError("Please describe what you saw."); return; }
    if (!photo) { setError("Please attach a photo of the waste issue."); return; }
    if (photo.size > 4 * 1024 * 1024) { setError("Please choose a photo smaller than 4 MB."); return; }
    setSubmitting(true);
    try {
      const currentLocation = await updateDeviceLocation();
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("landmark", landmark.trim());
      formData.append("latitude", String(currentLocation.latitude));
      formData.append("longitude", String(currentLocation.longitude));
      formData.append("locationAccuracy", String(currentLocation.accuracy));
      formData.append("description", description.trim());
      formData.append("photo", photo);
      await reportIssue(formData);
      setTitle(""); setLandmark(""); setDescription(""); setPhoto(null);
      form.reset();
      setTab("active");
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit the report. Please try again.");
    } finally { setSubmitting(false); }
  };

  const handleResolve = async (reportId) => {
    setError("");
    setResolvingId(reportId);
    try {
      await resolveReport(reportId);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update the report status. Please try again.");
    } finally {
      setResolvingId("");
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setError("");
    setDeletingId(reportId);
    try {
      await deleteReport(reportId);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the report. Please try again.");
    } finally {
      setDeletingId("");
    }
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
          <p className="dashboard-subtitle">{user.role === "admin" || user.role === "municipal" ? "Review community reports and track their progress." : "Help keep your neighbourhood clean and safe."}</p>
        </div>
        <div className="dashboard-header-actions"><Link className="dashboard-home-link" to="/">Home</Link><button className="dashboard-home-link" type="button" onClick={signOut}>Log out</button></div>
      </header>

      <section className="dashboard-stats" aria-label="Report summary">
        <div className="dashboard-stat"><span className="stat-icon">📍</span><div><p>Issues being handled</p><strong>{activeReports.length}</strong></div></div>
        <div className="dashboard-stat"><span className="stat-icon resolved-icon">✓</span><div><p>Issues resolved</p><strong>{resolvedReports.length}</strong></div></div>
      </section>

      {user.role !== "admin" && user.role !== "municipal" && <section className="dashboard-submit">
        <div className="dashboard-section-heading"><div><p className="dashboard-kicker">HELP YOUR COMMUNITY</p><h2>Report a waste issue</h2><p>Share a photo. Your browser will ask permission to capture the issue location. Exact coordinates go to the local team; public report lists hide them.</p></div><span className="submit-emoji" aria-hidden="true">🌱</span></div>
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <input type="text" aria-label="Short title (required)" placeholder="Short title (e.g. Waste dumped near park) — required" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          <input type="text" aria-label="Street or nearby landmark (required)" placeholder="Street or nearby landmark — required" value={landmark} onChange={(e) => setLandmark(e.target.value)} required maxLength={200} />
          <div className={`dashboard-location-status ${locationStatus === "error" ? "has-error" : ""}`} role="status" aria-live="polite">
            <span>{locationMessage || "Finding your device location… Keep location enabled; this can take up to 30 seconds."}</span>
            {locationStatus !== "locating" && <button type="button" onClick={() => updateDeviceLocation().catch(() => {})}>{locationStatus === "ready" ? "Refresh location" : "Try again"}</button>}
          </div>
          <textarea aria-label="Issue details (required)" placeholder="Describe what you saw — required" value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={1000} />
          <label className="dashboard-file">Photo of the issue (required)<input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} required /></label>
          <button type="submit" disabled={submitting || locationStatus !== "ready"}>{submitting ? "Sending report…" : locationStatus === "locating" ? "Finding location…" : "Submit report"}</button>
        </form>
        {error && <p className="dashboard-error" role="alert">{error}</p>}
      </section>}

      <section className="dashboard-list-section">
        <div className="dashboard-tabs" role="tablist" aria-label={user.role === "admin" || user.role === "municipal" ? "Manage reports" : "Community reports"}>
          <button className={`dashboard-tab ${tab === "active" ? "selected" : ""}`} type="button" role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")}>{user.role === "admin" || user.role === "municipal" ? "Issues being handled" : "Active reports"} <span>{activeReports.length}</span></button>
          <button className={`dashboard-tab ${tab === "resolved" ? "selected" : ""}`} type="button" role="tab" aria-selected={tab === "resolved"} onClick={() => setTab("resolved")}>Resolved <span>{resolvedReports.length}</span></button>
        </div>
        {loading ? <p className="dashboard-empty">Loading reports…</p> : reports.length === 0 ? (
          <div className="dashboard-empty"><span>{tab === "active" ? "🌿" : "✅"}</span><strong>{tab === "active" ? "No active reports yet" : "No resolved reports yet"}</strong><p>{tab === "active" ? "New community reports will appear here." : "Resolved issues will appear here so everyone can see the progress."}</p></div>
        ) : <div className="dashboard-report-list">{reports.map((report) => <ReportCard key={report._id} report={report} canResolve={user.role === "admin" || user.role === "municipal"} onResolve={handleResolve} resolving={resolvingId === report._id} canDelete={user.role === "admin" || user.role === "municipal"} onDelete={handleDelete} deleting={deletingId === report._id} showReporter={user.role === "admin" || user.role === "municipal"} />)}</div>}
      </section>
    </main>
  );
}

export default Dashboard;
