import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Application from "expo-application";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";

const COLLEGE_SSID = "YourCollegeWiFiName";

export default function StudentScreen() {
  const { user, logout } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [marked, setMarked] = useState(false);

  const handleScan = async ({ data }) => {
    if (marked) return;
    setScanning(false);

    try {
      const { sessionId } = JSON.parse(data);

      const deviceId = Application.androidId ||
                       await Application.getIosIdForVendorAsync() ||
                       "unknown";

      const res = await axios.post(`${BACKEND_URL}/api/session/mark`, {
        sessionId,
        studentUid: user.uid,
        ssid: COLLEGE_SSID,
        deviceId,
      });

      setMarked(true);
      Alert.alert("✅ Success", res.data.message);
    } catch (err) {
      Alert.alert("Failed", err.response?.data?.error || "Something went wrong");
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permText}>Camera permission is needed to scan QR</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Panel</Text>
      <Text style={styles.name}>Welcome, {user?.name}</Text>

      {scanning ? (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      ) : (
        <TouchableOpacity
          style={[styles.button, marked && styles.buttonDone]}
          onPress={() => setScanning(true)}
          disabled={marked}
        >
          <Text style={styles.buttonText}>
            {marked ? "Attendance Marked ✅" : "Scan QR to Mark Attendance"}
          </Text>
        </TouchableOpacity>
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
  name: { fontSize: 16, color: "#555", marginBottom: 40 },
  camera: { flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 24 },
  button: { backgroundColor: "#4F46E5", padding: 16, borderRadius: 10, alignItems: "center", marginBottom: 16 },
  buttonDone: { backgroundColor: "#22c55e" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  permText: { textAlign: "center", marginBottom: 20, fontSize: 16, color: "#555" },
  logout: { marginTop: 20, alignItems: "center" },
  logoutText: { color: "#888", fontSize: 14 },
});