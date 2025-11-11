import React from "react";
import { useNavigate } from "react-router-dom";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const u = user || JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser && setUser(null);
    navigate("/");
  }

  return (
    <div style={{textAlign:"center",padding:40}}>
      <div style={{marginBottom:16}}>
        <div style={{
          margin:"0 auto", width:110, height:110, borderRadius:"50%", background:"#fff",
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 20px rgba(0,0,0,0.15)"
        }}>
          <span style={{fontSize:40}}>👤</span>
        </div>
      </div>

      <div style={{maxWidth:720, margin:"0 auto"}}>
        <div style={{background:"#eee", padding:20, borderRadius:30, marginBottom:16}}>
          <div style={{textAlign:"left", color:"#666", fontWeight:700}}>NAME</div>
          <div style={{paddingTop:8}}>{u.name || "—"}</div>
        </div>

        <div style={{background:"#eee", padding:20, borderRadius:30, marginBottom:16}}>
          <div style={{textAlign:"left", color:"#666", fontWeight:700}}>EMAIL</div>
          <div style={{paddingTop:8}}>{u.email || "—"}</div>
        </div>

        <div style={{marginTop:24}}>
          <button onClick={logout} style={{padding:"12px 28px", background:"#16a34a", color:"#fff", border:"none", borderRadius:8, cursor:"pointer"}}>
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
}
