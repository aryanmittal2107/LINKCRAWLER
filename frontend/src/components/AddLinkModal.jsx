import React, { useState } from "react";

export default function AddLinkModal({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Add link</h3>
        <div className="field"><input placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",border:0,outline:0}}/></div>
        <div className="field"><input placeholder="url" value={url} onChange={e=>setUrl(e.target.value)} style={{width:"100%",border:0,outline:0}}/></div>
        <div className="field"><textarea placeholder="notes" value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",border:0,outline:0}}/></div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={() => onSave({ title, url, notes })} style={{background:"#16a34a",color:"#fff",border:0,padding:"8px 14px",borderRadius:8}}>Save</button>
        </div>
      </div>
    </div>
  );
}
