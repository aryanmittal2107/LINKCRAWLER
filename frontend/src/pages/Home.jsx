// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { fetchLinks, createLink, deleteLink } from "../api"; // adjust path if necessary

export default function Home({ user, setUser }) {
  const [query, setQuery] = useState("");
  const [links, setLinks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // category (tag) state
  const [selectedCategory, setSelectedCategory] = useState("");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // predefined categories requested by the user
  const predefinedCategories = ["Movie", "Videos", "Images", "YouTube", "Sports"];

  // small heuristic detector (used to populate missing categories client-side only)
  function detectCategoryFromURL(url = "", title = "") {
    const u = (url || "").toLowerCase();
    const t = (title || "").toLowerCase();
    const check = (s) => u.includes(s) || t.includes(s);

    if (u.includes("youtube.com") || u.includes("youtu.be") || check("youtube")) return "YouTube";
    if (u.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/) || check("unsplash") || check("pexels") || check("pixabay") || check("image") || check("photo")) return "Images";
    if (u.includes("video") || u.match(/\.(mp4|mov|webm)$/) || check("video")) return "Videos";
    if (u.includes("imdb") || u.includes("netflix") || check("movie") || check("film")) return "Movie";
    if (check("espn") || check("cric") || check("cricket") || check("sport") || check("football") || check("soccer")) return "Sports";
    return "";
  }

  // derive categories (tags + predefined) from links
  // returns array of { key: 'sports', label: 'Sports' }
  const categories = React.useMemo(() => {
    const map = new Map();
    // add predefined categories with preferred casing
    predefinedCategories.forEach((c) => map.set(String(c).toLowerCase(), c));

    (links || []).forEach((l) => {
      if (l.category && String(l.category).trim()) {
        const raw = String(l.category).trim();
        const key = raw.toLowerCase();
        if (!map.has(key)) map.set(key, raw);
      }
      if (Array.isArray(l.tags)) {
        l.tags.forEach((t) => {
          if (t && String(t).trim()) {
            const raw = String(t).trim();
            const key = raw.toLowerCase();
            if (!map.has(key)) map.set(key, raw);
          }
        });
      }
    });

    return Array.from(map.entries()).map(([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [links]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchLinks();
        const list = Array.isArray(res) ? res : (res && res.links) ? res.links : [];

        // CLIENT-SIDE: fill missing category for existing links using detector
        const normalized = list.map((l) => {
          const copy = { ...l };
          if (!copy.category || !String(copy.category).trim()) {
            const detected = detectCategoryFromURL(copy.url, copy.title);
            if (detected) copy.category = detected; // client-side only
            else copy.category = ""; // keep consistent type
          }
          return copy;
        });

        setLinks(normalized);
        setFiltered(normalized);
      } catch (err) {
        console.error("Failed to load links:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSearchSubmit(e) {
    e && e.preventDefault();
    const q = (query || "").trim().toLowerCase();

    // start from all links
    let out = links;

    // CATEGORY FILTER — strict: match only saved category or tags (case-insensitive)
    if (selectedCategory) {
      const sel = String(selectedCategory).toLowerCase();
      out = out.filter((l) => {
        const linkCategory = (l.category || "").toString().trim().toLowerCase();
        const tags = Array.isArray(l.tags) ? l.tags.map(String).map((x) => x.trim().toLowerCase()) : [];
        return (linkCategory && linkCategory === sel) || tags.some((t) => t === sel);
      });
    }

    // if there is a text query, further filter by title/url/notes
    if (q) {
      out = out.filter((l) => {
        return (
          (l.title && l.title.toLowerCase().includes(q)) ||
          (l.url && l.url.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q))
        );
      });
    }

    setFiltered(out);
  }

  function clearSearch() {
    setQuery("");
    setSelectedCategory("");
    setFiltered(links);
  }

  function openAddLinkModal() {
    setError(null);
    setNewTitle("");
    setNewUrl("");
    setNewNotes("");
    setNewCategory("");
    setShowModal(true);
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    setShowModal(false);
    setError(null);
    document.body.style.overflow = "";
  }

  // detect for save (same heuristics)
  function detectCategoryFromURLOnSave(url) {
    return detectCategoryFromURL(url, "");
  }

  // save new link — always ensure the payload/category is the display label
  async function handleSaveLink(e) {
    e && e.preventDefault();
    setError(null);
    if (!newTitle || !newUrl) {
      setError("Title and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: newTitle,
        url: newUrl,
        notes: newNotes,
      };

      // Decide finalCategory (display label)
      const auto = detectCategoryFromURLOnSave(newUrl);
      let finalCategory = "";
      if (newCategory && String(newCategory).trim()) {
        const lowered = String(newCategory).toLowerCase();
        const found = categories.find((c) => c.key === lowered);
        if (found) finalCategory = found.label;
        else {
          const raw = String(newCategory).trim();
          finalCategory = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
      } else if (auto) {
        finalCategory = auto;
      }

      if (finalCategory) payload.category = finalCategory;

      const saved = await createLink(payload);
      const savedLink = saved && saved.link ? saved.link : saved;

      // ensure the client-side saved object always has the category (display label)
      if (!savedLink.category && payload.category) {
        savedLink.category = payload.category;
      } else if (savedLink.category) {
        savedLink.category = String(savedLink.category).trim();
      } else {
        savedLink.category = "";
      }

      const updated = [savedLink, ...links];
      setLinks(updated);
      setFiltered(updated);
      setShowModal(false);
      document.body.style.overflow = "";
    } catch (err) {
      console.error("Failed to save link:", err);
      setError(err && (err.body?.message || err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteLink(id);
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

  // small style helpers (unchanged except added sizes for centered header)
  const styles = {
    pageBg: { background: "linear-gradient(180deg, #f6b600 0%, #f0a800 100%)", minHeight: "100vh" },
    container: { maxWidth: 1100, margin: "0 auto", padding: "22px 18px" },
    // searchBar: keep visually the same, but we'll constrain width so it's centered below logo
    searchBar: { display: "flex", gap: 12, alignItems: "center", padding: 14, background: "#fff", borderRadius: 999, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", width: "100%" },
    searchFormWrapper: { display: "flex", justifyContent: "center", width: "100%" }, // centers the search form
    searchFormInner: { width: "min(820px, 100%)" }, // control the width of the pill search bar
    input: { border: "none", outline: "none", fontSize: 18, flex: 1, background: "transparent" },
    select: { borderRadius: 8, padding: "6px 10px", border: "1px solid #ddd" },
    btn: { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" },
    muted: { fontSize: 12, color: "#666" },
    card: { background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 8px 20px rgba(0,0,0,0.08)", textAlign: "center" },
    badge: { display: "inline-block", padding: "4px 8px", borderRadius: 999, fontSize: 12, background: "#222", color: "#fff", marginTop: 8 },
  };

  return (
    <div style={styles.pageBg}>
      {/* HERO / HEADER */}
      <header style={{ background: "transparent", padding: "20px 0" }}>
        <div style={styles.container}>
          {/* Centered logo + title stacked above the search bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/spider-logo.webp" alt="Spider" style={{ width: 62, height: 62, borderRadius: 12 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "2.4rem", color: "#111", margin: 0 }}>LinkCrawler</h1>
            </div>

            {/* Center the search form below the logo/title */}
            <div style={styles.searchFormWrapper}>
              <form className="search-bar" onSubmit={handleSearchSubmit} style={{ ...styles.searchBar, ...styles.searchFormInner }}>
                <input
                  aria-label="Search links"
                  placeholder="Search by title, url or notes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={styles.input}
                />

                {/* Category (tag) selector — improved styling */}
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="Filter by category" style={styles.select}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>

                <button type="submit" style={{ ...styles.btn, background: "#111", color: "#fff" }}>Search</button>
                <button type="button" onClick={clearSearch} style={{ ...styles.btn, background: "#fff", border: "1px solid #ddd" }}>Clear</button>
                <button type="button" onClick={openAddLinkModal} style={{ ...styles.btn, background: "#fff", border: "1px solid #ddd" }}>Add Link</button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        {loading ? (
          <div>Loading links…</div>
        ) : (
          <div>
            {filtered.length === 0 ? (
              <div className="mt-6 text-center text-slate-500">No links found.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {filtered.map((link) => {
                  const id = link._id || link.id;
                  return (
                    <div key={id} style={styles.card}>
                      <div style={{ height: 120, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                        {link.placeholderImage ? <img src={link.placeholderImage} alt={link.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 36 }}>{(link.title || "").charAt(0).toUpperCase()}</div>}
                      </div>

                      <div style={{ marginTop: 12, fontWeight: 600 }}>{link.title}</div>
                      {link.category && <div style={styles.badge}>{link.category}</div>}

                      <div style={{ marginTop: 10 }}>
                        <button onClick={() => window.open(link.url, "_blank")} style={{ ...styles.btn, marginRight: 8, background: "#0b74de", color: "#fff" }}>Open</button>
                        <button onClick={() => handleDelete(id)} disabled={deletingId === id} style={{ ...styles.btn, background: deletingId === id ? "#999" : "#ef4444", color: "#fff" }}>{deletingId === id ? "..." : "Delete"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Link Modal — fixed, centered, improved styling */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* backdrop */}
          <div onClick={closeModal} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

          <div style={{ position: "relative", width: "min(760px, 92%)", borderRadius: 16, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: 24 }}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Add Link</h3>
            <form onSubmit={handleSaveLink}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Title</label>
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>URL</label>
                  <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Notes</label>
                  <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", minHeight: 84 }} />
                </div>

                {/* category select — choose from predefined or enter a custom one */}
                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Category</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}>
                      <option value="">(none)</option>
                      {categories.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                    <input placeholder="Or type a custom category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd", flex: 1 }} />
                  </div>
                </div>

                {error && <div style={{ color: "red" }}>{error}</div>}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                  <button type="button" onClick={closeModal} style={{ ...styles.btn, padding: "10px 14px", background: "#fff", border: "1px solid #ddd" }}>Cancel</button>
                  <button type="submit" disabled={saving || !newTitle.trim() || !newUrl.trim()} style={{ ...styles.btn, padding: "10px 14px", background: "#111", color: "#fff" }}>{saving ? "Saving…" : "Save"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ height: 60 }} />
    </div>
  );
}
