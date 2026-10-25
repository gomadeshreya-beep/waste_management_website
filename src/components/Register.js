import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser, resendVerificationEmail } from "../services/api";
import useBackendWarmup from "../hooks/useBackendWarmup";
import "../styles/theme.css";

function Register() {
  const [accountType, setAccountType] = useState("resident");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { status: serverStatus, retry: retryServer } = useBackendWarmup();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^[A-Za-z\s'-]+$/.test(name.trim())) {
      setError("Enter a name using letters, spaces, apostrophes or hyphens.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const submittedEmail = email.trim().toLowerCase();
      const { data } = await registerUser({ name: name.trim(), email: submittedEmail, password, accountType });
      setMessage(data.message || "Registration successful! Please check your inbox or spam for the verification email.");
      setVerificationEmail(data.verificationRequired ? submittedEmail : "");
      setName("");
      setPassword("");
    } catch (err) {
      const response = err.response?.data;
      if (response?.code === "EMAIL_NOT_VERIFIED" || response?.code === "VERIFICATION_EMAIL_FAILED") {
        setVerificationEmail(email.trim().toLowerCase());
        setMessage(response.error);
      } else {
        setError(response?.error || "Could not register. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setMessage("");
    setResending(true);
    try {
      const { data } = await resendVerificationEmail(verificationEmail);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send the verification email. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="register auth-card">
        <Link className="auth-brand" to="/">♻ CleanNeighbour</Link>
        <h2>{accountType === "admin" ? "Create an admin account" : "Create a resident account"}</h2>
        <p>{accountType === "admin" ? "Admin access is limited to the approved CleanNeighbour admin email." : "Join your neighbourhood and help report waste issues."}</p>
        <div className="auth-role-switch" role="group" aria-label="Register as">
          <button type="button" className={accountType === "resident" ? "selected" : ""} aria-pressed={accountType === "resident"} onClick={() => { setAccountType("resident"); setError(""); setMessage(""); }}>Resident</button>
          <button type="button" className={accountType === "admin" ? "selected" : ""} aria-pressed={accountType === "admin"} onClick={() => { setAccountType("admin"); setError(""); setMessage(""); }}>Admin</button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        {verificationEmail && <button className="auth-secondary-button" type="button" onClick={handleResendVerification} disabled={resending || serverStatus !== "ready"}>{resending ? "Sending…" : "Resend verification email"}</button>}
        {serverStatus === "connecting" && (
          <p className="auth-connect-status" role="status">
            Connecting to the server. The first visit can take up to a minute while it wakes up.
          </p>
        )}
        {serverStatus === "unavailable" && (
          <div className="auth-connect-error" role="alert">
            <span>Could not reach the server. Check your connection and try again.</span>
            <button className="auth-retry-button" type="button" onClick={retryServer}>Try again</button>
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            className="auth-input"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <label htmlFor="register-email">Email</label>
          {accountType === "admin" && <small className="auth-role-note">Use the approved CleanNeighbour admin email. The verification email goes to that admin mailbox.</small>}
          <input
            id="register-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="register-password">Password</label>
          <div className="auth-password-field">
            <input
              id="register-password"
              className="auth-input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button className="auth-button" type="submit" disabled={loading || serverStatus !== "ready"}>
            {loading ? "Creating account..." : serverStatus === "connecting" ? "Connecting..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}

export default Register;
