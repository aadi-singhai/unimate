import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/attendance`);
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Attendance Records</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Student</th>
            <th style={styles.th}>Subject</th>
            <th style={styles.th}>Class</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={5} style={styles.empty}>No records found</td></tr>
          ) : (
            records.map((r, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{r.studentName || r.studentUid}</td>
                <td style={styles.td}>{r.subject}</td>
                <td style={styles.td}>{r.classId}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{r.status}</span>
                </td>
                <td style={styles.td}>{new Date(r.markedAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: 32 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  thead: { backgroundColor: "#4F46E5", color: "#fff" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 14 },
  td: { padding: "12px 16px", fontSize: 14, color: "#444" },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#f9f9f9" },
  badge: { backgroundColor: "#dcfce7", color: "#16a34a", padding: "2px 10px", borderRadius: 20, fontSize: 12 },
  empty: { padding: 24, textAlign: "center", color: "#888" },
  loading: { padding: 32, color: "#888" },
};