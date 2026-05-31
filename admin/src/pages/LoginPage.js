import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      if (res.data.role !== "admin") {
        setError("Access denied. Admins only.");
        return;
      }
      localStorage.setItem("adminUser", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Unimate</h1>
        <p style={styles.subtitle}>Admin Panel</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f3f4f6" },
  card: { backgroundColor: "#fff", padding: 40, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: 360 },
  title: { textAlign: "center", color: "#4F46E5", marginBottom: 4 },
  subtitle: { textAlign: "center", color: "#888", marginBottom: 24 },
  error: { color: "red", marginBottom: 12, fontSize: 14 },
  input: { width: "100%", padding: 12, marginBottom: 14, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, boxSizing: "border-box" },
  button: { width: "100%", padding: 12, backgroundColor: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" },
};