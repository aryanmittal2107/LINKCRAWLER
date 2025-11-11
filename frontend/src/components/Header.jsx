// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Header component
 * Props:
 *  - user: object|null  (optional) - if present we show initials and welcome text
 *  - onProfileClick: fn (optional) - called when avatar/profile button clicked
 *
 * Note: Put your spider image in the project's public/ folder as "spider-logo.webp"
 * so it's available at "/spider-logo.webp".
 */
export default function Header({ user, onProfileClick }) {
  // compute initials fallback (e.g., "AM" from "Aryan Mittal")
  const initials = (() => {
    if (!user) return null;
    const name = user.name || user.username || user.email || "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  // logo served from public folder (safer than importing)
  const logoSrc = "/spider-logo.webp";

  return (
    <header className="topbar" role="banner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar button on the left */}
        <button
          onClick={() => {
            if (typeof onProfileClick === "function") onProfileClick();
          }}
          className="avatar-btn"
          aria-label="Profile"
          title={user ? `Profile: ${user.username || user.name || ""}` : "Profile"}
          type="button"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {user && user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
          ) : initials ? (
            <div className="avatar-fallback" aria-hidden="true" style={{
              width: 36, height: 36, borderRadius: "50%", background: "#5b36a6", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700
            }}>
              {initials}
            </div>
          ) : (
            <div className="avatar-fallback" aria-hidden="true" style={{
              width: 36, height: 36, borderRadius: "50%", background: "transparent", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20.5C4 16.91 7.58 14 12 14s8 2.91 8 6.5V22H4v-1.5z" fill="currentColor"/>
              </svg>
            </div>
          )}
        </button>

        {/* logo + title */}
        <div className="logo-wrap" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={logoSrc}
            alt="Spider logo"
            className="logo-img"
            style={{ width: 48, height: 48, objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <h1 style={{ fontSize: 22, margin: 0, color: "#fff", fontFamily: "Georgia, serif" }}>LinkCrawler</h1>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {!user ? (
          <>
            <Link className="nav-link" to="/login" style={{ color: "#00eaff", textDecoration: "none", fontWeight: 600 }}>Login</Link>
            <Link className="nav-link" to="/register" style={{ color: "#00eaff", textDecoration: "none", fontWeight: 600 }}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ color: "#fff", marginRight: 12 }}>Welcome, {user.username || user.name}</span>
            <Link className="nav-link" to="/profile" style={{ color: "#00eaff", textDecoration: "none", fontWeight: 600 }}>Profile</Link>
          </>
        )}
      </nav>
    </header>
  );
}
