import React from "react";

export default function SearchBar({ value, setValue, onSubmit }) {
  return (
    <div className="search-wrap">
      <div className="search-bar">
        <span style={{fontSize:22}}>🔍</span>
        <input
          placeholder="Enter the link you want to search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        />
      </div>
      <button className="add-btn" onClick={onSubmit}>Add Link</button>
    </div>
  );
}
