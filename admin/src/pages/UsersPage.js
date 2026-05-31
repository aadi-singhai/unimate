import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/users`);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  if (loading) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Users</h2>

      <div style={styles.filters}>
        {["all", "student", "teacher", "admin"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>College ID</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={styles.empty}>No users found</td></tr>
          ) : (
            filtered.map((u, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...roleBadge(u.role) }}>{u.role}</span>
                </td>
                <td style={styles.td}>{u.collegeId}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const roleBadge = (role) => {
  if (role === "admin") return { backgroundColor: "#fde68a", color: "#92400e" };
  if (role === "teacher") return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  return { backgroundColor: "#dcfce7", color: "#16a34a" };
};

const styles = {
  container: { padding: 32 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  filters: { display: "flex", gap: 12, marginBottom: 24 },
  filterBtn: { padding: "8px 18px", borderRadius: 20, border: "1px solid #ddd", cursor: "pointer", backgroundColor: "#fff", fontSize: 14 },
  filterActive: { backgroundColor: "#4F46E5", color: "#fff", border: "1px solid #4F46E5" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  thead: { backgroundColor: "#4F46E5", color: "#fff" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 14 },
  td: { padding: "12px 16px", fontSize: 14, color: "#444" },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#f9f9f9" },
  badge: { padding: "2px 10px", borderRadius: 20, fontSize: 12 },
  empty: { padding: 24, textAlign: "center", color: "#888" },
  loading: { padding: 32, color: "#888" },
};