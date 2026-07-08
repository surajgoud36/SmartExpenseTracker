import { useState } from "react";
import { api } from "../api/client";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const { data } = await api.post(path, body);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <header className="app-header auth-header">
        <h1>Expense Tracker</h1>
      </header>
      <div className="panel auth-card">
        <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <div className="form">
          {mode === "register" && (
            <label>Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input type="password" value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && submit()} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
          <p className="muted auth-switch" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "New here? Create an account" : "Already registered? Log in"}
          </p>
        </div>
      </div>
    </div>
  );
}