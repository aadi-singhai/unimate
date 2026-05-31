import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    onLogout();
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>Unimate Admin</span>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/attendance" style={styles.link}>Attendance</Link>
        <Link to="/users" style={styles.link}>Users</Link>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#4F46E5", color: "#fff" },
  logo: { fontSize: 20, fontWeight: "bold" },
  links: { display: "flex", gap: 24, alignItems: "center" },
  link: { color: "#fff", textDecoration: "none", fontSize: 15 },
  logout: { background: "transparent", border: "1px solid #fff", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer" },
};