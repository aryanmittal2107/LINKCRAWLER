// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { fetchLinks, createLink, deleteLink } from "../api"; // adjust path if necessary

export default function Home({ user, setUser }) {
  const [query, setQuery] = useState("");
  const [links, setLinks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // for spinner/disabled state

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await fetchLinks();
        const arr = Array.isArray(resp) ? resp : resp.links || [];
        setLinks(arr);
        setFiltered(arr);
      } catch (err) {
        console.error("Failed to fetch links:", err);
        setLinks([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSearchSubmit(e) {
    e && e.preventDefault();
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFiltered(links);
      return;
    }
    const out = links.filter((l) => {
      return (
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.url && l.url.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    });
    setFiltered(out);
  }

  function clearSearch() {
    setQuery("");
    setFiltered(links);
  }

  function openAddLinkModal() {
    setError(null);
    setNewTitle("");
    setNewUrl("");
    setNewNotes("");
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setError(null);
  }

  async function handleSaveLink(e) {
    e && e.preventDefault();
    setError(null);
    if (!newTitle || !newUrl) {
      setError("Title and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const saved = await createLink({
        title: newTitle,
        url: newUrl,
        notes: newNotes,
      });
      const savedLink = saved && saved.link ? saved.link : saved;
      const updated = [savedLink, ...links];
      setLinks(updated);
      setFiltered((prev) => [savedLink, ...(Array.isArray(prev) ? prev : [])]);
      closeModal();
    } catch (err) {
      console.error("Failed to save link:", err);
      const msg = err && (err.body?.message || err.message || String(err));
      setError(msg || "Failed to save link");
    } finally {
      setSaving(false);
    }
  }

  // Helper: ensure url has protocol
  function normalizeUrl(url) {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  // DELETE handler: only id needed. UI click handlers will prevent navigation.
  async function handleDeleteLink(id) {
    if (!id) return;
    const ok = window.confirm("Are you sure you want to delete this link?");
    if (!ok) return;
    try {
      setDeletingId(id);
      await deleteLink(id);
      // remove from lists
      setLinks((prev) => prev.filter((l) => String(l._id || l.id) !== String(id)));
      setFiltered((prev) => prev.filter((l) => String(l._id || l.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete link:", err);
      const msg = err && (err.body?.message || err.message || String(err));
      alert(msg || "Failed to delete link");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* HERO / HEADER */}
      <header className="header" style={{ paddingTop: 28, paddingBottom: 8 }}>
        <div className="logo-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <img
            src="/spider-logo.webp"
            alt="Spider Logo"
            style={{ width: 70, height: 70, objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "3rem", color: "#000", fontWeight: 700, margin: 0 }}>
            LinkCrawler
          </h1>
        </div>

        <div className="search-wrap" style={{ marginTop: 18 }}>
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              aria-label="Search links"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter the link you want to search"
              autoComplete="off"
            />
            <button type="submit" style={{ display: "none" }}>Search</button>
          </form>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" className="add-btn" onClick={openAddLinkModal}>
              Add Link
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ padding: "20px 24px" }}>
        <h3 className="section-title">FREQUENTLY VISITED LINKS</h3>

        {loading ? (
          <p>Loading links…</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 40 }}>
            No links found. {links.length ? "Try a different search." : "Add your first link!"}
          </p>
        ) : (
          <div className="grid">
            {filtered.map((link) => {
              const id = link._id || link.id || link.url;
              const visitUrl = normalizeUrl(link.url);

              return (
                <div className="link-card" key={id} style={{ display: "inline-block" }}>
                  {/* Anchor wraps the visible card content and opens in new tab */}
                  <a
                    href={visitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                    // prevent default navigation when user clicks on delete quickly (safety)
                    onClick={(e) => {
                      // nothing else here — delete button will call stopPropagation/preventDefault
                    }}
                  >
                    <div className="thumb" style={{ position: "relative", pointerEvents: "auto" }}>
                      {link.img ? (
                        <img src={link.img} alt={link.title || "link"} style={{ display: "block" }} />
                      ) : (
                        <div className="initial">{(link.title || "L").charAt(0).toUpperCase()}</div>
                      )}

                      {/* Delete button overlay (top-right) - explicitly prevent anchor navigation */}
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={(e) => {
                          // ensure click on delete does not trigger the anchor navigation
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteLink(id);
                        }}
                        disabled={deletingId === id}
                        title="Delete"
                        style={{
                          position: "absolute",
                          right: -6,
                          top: -6,
                          background: deletingId === id ? "#999" : "#333",
                          color: "#fff",
                          border: "none",
                          padding: "6px 8px",
                          borderRadius: 8,
                          cursor: "pointer",
                          pointerEvents: "auto", // ensure button gets clicks
                        }}
                      >
                        {deletingId === id ? "..." : "Delete"}
                      </button>
                    </div>

                    <div className="link-title" style={{ textAlign: "center", marginTop: 12 }}>
                      {link.title}
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal" role="document">
            <h3>Add link</h3>

            <form onSubmit={handleSaveLink}>
              <div className="field">
                <input
                  type="text"
                  placeholder="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="field">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="field">
                <textarea
                  placeholder="notes (optional)"
                  rows="3"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ color: "#b00020", marginBottom: 6, fontWeight: 700 }}>
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn save" disabled={saving || !newTitle.trim() || !newUrl.trim()}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="footer-space" />
    </div>
  );
}
