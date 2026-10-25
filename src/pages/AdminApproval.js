import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { decideAdminRegistration, getAdminApprovalRequest } from "../services/api";
import "../styles/theme.css";

function AdminApproval() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus("invalid");
      setError("This approval link is missing its token.");
      return () => { active = false; };
    }
    getAdminApprovalRequest(token)
      .then(({ data }) => {
        if (!active) return;
        setRequest(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setStatus("invalid");
        setError(err.response?.data?.error || "This approval link is invalid or expired.");
      });
    return () => { active = false; };
  }, [token]);

  async function handleDecision(decision) {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { data } = await decideAdminRegistration(token, decision);
      setMessage(data.message);
      setStatus(decision === "approve" ? "approved" : "rejected");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update this admin request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card verification-card">
        <Link className="auth-brand" to="/">♻ CleanNeighbour</Link>
        <h2>{status === "checking" ? "Checking request" : status === "approved" ? "Admin request approved" : status === "rejected" ? "Admin request rejected" : "Review admin request"}</h2>
        {status === "checking" && <p role="status">Please wait while we load the request.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        {request && status === "ready" && (
          <>
            <p>Review this request before granting access. Only approve it if you recognize and authorize this person.</p>
            <p className="auth-success"><strong>Name:</strong> {request.name}<br /><strong>Email:</strong> {request.email}</p>
            <button className="auth-button" type="button" onClick={() => handleDecision("approve")} disabled={submitting}>
              {submitting ? "Saving…" : "Approve admin access"}
            </button>
            <button className="auth-secondary-button" type="button" onClick={() => handleDecision("reject")} disabled={submitting}>
              Reject request
            </button>
          </>
        )}
        {(status === "approved" || status === "rejected") && <p className="auth-switch"><Link to="/">Return to CleanNeighbour</Link></p>}
      </section>
    </main>
  );
}

export default AdminApproval;
