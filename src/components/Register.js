import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "../styles/theme.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      const { data } = await registerUser({ name: name.trim(), email: email.trim(), password });
      setMessage(data.message || "Registration successful.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Registration error:",err);
      setError(err.response?.data?.error || "Could not register. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="register auth-card">
        <Link className="auth-brand" to="/">♻ CleanNeighbour</Link>
        <h2>Create an account</h2>
        <p>Join your neighbourhood and help report waste issues.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
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
          <input
            id="register-password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}

export default Register;
