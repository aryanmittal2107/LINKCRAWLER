import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api"; // expects your existing api helper
import "./../styles.css";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await register({ name, username, password, email });
      if (res && res.token) {
        localStorage.setItem("token", res.token);
        if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/"); // after register
      } else {
        alert(res.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration error");
    }
  }

  return (
    <div className="auth-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="register-title">HEY THERE! <img src="/spider-logo.webp" alt="spider" className="auth-spider-icon" /></h1>

        <input
          className="register-input"
          type="text"
          placeholder="NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="register-input"
          type="text"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="register-input"
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="register-input"
          type="email"
          placeholder="EMAIL/PHONE NO"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="register-btn" type="submit">REGISTER</button>
      </form>
    </div>
  );
}
