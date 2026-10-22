import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, resendVerificationEmail } from "../services/api";
import useBackendWarmup from "../hooks/useBackendWarmup";
import "../styles/theme.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { status: serverStatus, retry: retryServer } = useBackendWarmup();
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setVerificationMessage("");
    setVerificationEmail("");
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      if (!data.token) throw new Error("The server did not return a login token.");
      sessionStorage.setItem("cleanlane-token", data.token);
      sessionStorage.setItem("cleanlane-user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      const response = err.response?.data;
      setError(response?.error || err.message || "Could not log in. Check your connection.");
      if (response?.code === "EMAIL_NOT_VERIFIED") setVerificationEmail(email.trim().toLowerCase());
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setVerificationMessage("");
    setResending(true);
    try {
      const { data } = await resendVerificationEmail(verificationEmail);
      setVerificationMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send the verification email. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="login auth-card">
        <Link className="auth-brand" to="/">♻ CleanNeighbour</Link>
        <h2>Login</h2>
        <p>Log in to report issues and follow their progress.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {verificationMessage && <p className="auth-success" role="status">{verificationMessage}</p>}
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
        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-field">
            <input
              id="login-password"
              className="auth-input"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            {loading ? "Logging in..." : serverStatus === "connecting" ? "Connecting..." : "Login"}
          </button>
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}

export default Login;
