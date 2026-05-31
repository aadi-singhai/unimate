import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function DashboardPage() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/stats`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Dashboard</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.label}>Total Students</p>
          <p style={styles.value}>{stats.students}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Total Teachers</p>
          <p style={styles.value}>{stats.teachers}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Attendance Records</p>
          <p style={styles.value}>{stats.attendance}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  card: { backgroundColor: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" },
  label: { color: "#888", fontSize: 14, marginBottom: 8 },
  value: { fontSize: 36, fontWeight: "bold", color: "#4F46E5" },
  loading: { padding: 32, color: "#888" },
};