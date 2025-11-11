import React from "react";

export default function LinkCard({ item, onDelete, placeholder }) {
  const imgUrl = item.placeholderImage || placeholder;
  const initial = (item.title||"").charAt(0).toUpperCase();

  return (
    <div className="link-card">
      <div className="thumb">
        {imgUrl ? <img src={imgUrl} alt={item.title} /> : <div className="initial">{initial}</div>}
        <button className="delete-btn" onClick={() => onDelete(item._id || item.id)}>Delete</button>
      </div>
      <div className="link-title">{item.title}</div>
    </div>
  );
}
