import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerificationEmail, verifyEmail } from "../services/api";
import "../styles/theme.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus("invalid");
      setError("This verification link is missing its token. Enter your email below to request a new one.");
      return () => { active = false; };
    }
    verifyEmail(token)
      .then(({ data }) => {
        if (!active) return;
        setStatus("verified");
        setMessage(data.message || "Your email is verified. You can now log in.");
      })
      .catch((err) => {
        if (!active) return;
        setStatus("invalid");
        setError(err.response?.data?.error || "This link is invalid or expired. Request a new verification email below.");
      });
    return () => { active = false; };
  }, [token]);

  async function handleResend(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResending(true);
    try {
      const { data } = await resendVerificationEmail(email.trim().toLowerCase());
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send the verification email. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card verification-card">
        <Link className="auth-brand" to="/">♻ CleanNeighbour</Link>
        <h2>{status === "checking" ? "Checking your email" : status === "verified" ? "Email verified" : "Verify your email"}</h2>
        {status === "checking" && <p role="status">Please wait while we check your verification link.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        {status === "verified" ? <Link className="auth-button verification-login-link" to="/login">Go to login</Link> : (
          <>
            <p>If you don’t see the message, check your spam or junk folder.</p>
            <form className="auth-form" onSubmit={handleResend}>
              <label htmlFor="verification-email">Email</label>
              <input id="verification-email" className="auth-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button className="auth-button" type="submit" disabled={resending}>{resending ? "Sending…" : "Resend verification email"}</button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default VerifyEmail;
