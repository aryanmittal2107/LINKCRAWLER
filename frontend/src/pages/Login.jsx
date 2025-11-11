import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api"; // expects your existing api helper
import "./../styles.css"; // make sure styles are loaded

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await login({ identifier, password });
      // if your api.login returns token or user:
      if (res && res.token) {
        localStorage.setItem("token", res.token);
        // optionally save user info if returned:
        if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/"); // go home
      } else {
        // if your login returns different shape, adapt above
        alert(res.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Login error");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">LOG IN! <img src="/spider-logo.webp" alt="spider" className="auth-spider-icon" /></h1>

        <input
          className="auth-input"
          type="text"
          placeholder="USERNAME / EMAIL"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn" type="submit">LOG IN</button>

        <div className="auth-footer">
          <a href="/register" className="auth-link">Dont have an account?</a>
        </div>
      </form>
    </div>
  );
}
