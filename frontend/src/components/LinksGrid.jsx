import React from "react";
import LinkCard from "./LinkCard";

export default function LinksGrid({ items, onDelete }) {
  function placeholderFor(title) {
    if (!title) return null;
    const t = title.toLowerCase();
    if (t.includes("movie") || t.includes("film")) return "/placeholders/movies.jpg";
    if (t.includes("sport")) return "/placeholders/sports.jpg";
    if (t.includes("study") || t.includes("notes") || t.includes("book")) return "/placeholders/studies.jpg";
    if (t.includes("youtube") || t.includes("video")) return "/placeholders/youtube.webp";
    return null;
  }

  return (
    <div className="grid">
      {items.map((it) => (
        <LinkCard key={it._id || it.id} item={it} onDelete={onDelete} placeholder={placeholderFor(it.title)} />
      ))}
    </div>
  );
}
