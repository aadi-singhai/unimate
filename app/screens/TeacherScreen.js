import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput } from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";

export default function TeacherScreen() {
  const { user, logout } = useAuth();
  const [qrImage, setQrImage] = useState(null);
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [roomId, setRoomId] = useState("");

  const generateQR = async () => {
    if (!subject || !classId) return Alert.alert("Error", "Enter subject and class ID");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/session/create`, {
        teacherUid: user.uid,
        subject,
        classId,
      });
      setQrImage(res.data.qrImage);
      setExpiresAt(res.data.expiresAt);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not generate QR");
    } finally {
      setLoading(false);
    }
  };

  const secondsLeft = expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Panel</Text>
      <Text style={styles.name}>Welcome, {user?.name}</Text>

      <TextInput style={styles.input} placeholder="Subject (e.g. Mathematics)" value={subject} onChangeText={setSubject} />
      <TextInput style={styles.input} placeholder="Class ID (e.g. CS-A)" value={classId} onChangeText={setClassId} />
      <TextInput style={styles.input} placeholder="Room ID (e.g. Room-204)" value={roomId} onChangeText={setRoomId}/>
      <TouchableOpacity style={styles.button} onPress={generateQR} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Generating..." : "Generate QR Code"}</Text>
      </TouchableOpacity>

      {qrImage && (
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrImage }} style={styles.qr} />
          <Text style={styles.expiry}>Show this on the smartboard</Text>
          {secondsLeft !== null && (
            <Text style={styles.timer}>⏱ Expires in ~{secondsLeft}s — regenerate if needed</Text>
          )}
        </View>
      )}

      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#4F46E5", marginTop: 40 },
  name: { fontSize: 16, color: "#555", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#4F46E5", padding: 16, borderRadius: 10, alignItems: "center", marginBottom: 24 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  qrContainer: { alignItems: "center" },
  qr: { width: 220, height: 220, marginBottom: 12 },
  expiry: { color: "#888", fontSize: 14 },
  timer: { color: "#e55", fontSize: 13, marginTop: 6 },
  logout: { marginTop: 40, alignItems: "center" },
  logoutText: { color: "#888", fontSize: 14 },
});