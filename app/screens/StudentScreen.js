import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Application from "expo-application";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";

export default function StudentScreen() {
  const { user, logout } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [marked, setMarked] = useState(false);

  const handleScan = async ({ data }) => {
    if (marked) return;
    setScanning(false);

    try {
      // Parse QR data
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        return Alert.alert("Error", "Invalid QR code.");
      }

      const { sessionId, classId, roomId } = parsed;
      if (!sessionId) return Alert.alert("Error", "QR code is missing session info.");

      // Get student UID — handles both 'uid' and '_id' field names
      const studentUid = user?.uid || user?._id;
      if (!studentUid) {
        return Alert.alert("Error", "Could not identify your account. Please log out and log in again.");
      }

      // Get device ID safely
      let deviceId = "unknown";
      try {
        if (Application.androidId) {
          deviceId = Application.androidId;
        } else {
          deviceId = (await Application.getIosIdForVendorAsync()) || "unknown";
        }
      } catch {
        deviceId = "unknown";
      }

      console.log("Marking attendance:", { sessionId, studentUid, deviceId, backendUrl: BACKEND_URL });

      const res = await axios.post(
        `${BACKEND_URL}/api/session/mark`,
        {
          sessionId,
          studentUid,
          ssid: "Aadi_Singhai", // must match COLLEGE_WIFI_SSID in .env
          deviceId,
        },
        { timeout: 10000 } // 10 second timeout so it doesn't hang silently
      );

      setMarked(true);
      Alert.alert("✅ Success", res.data.message);
    } catch (err) {
      // Show the most useful error message available
      const message =
        err.response?.data?.error ||   // backend error (e.g. "QR expired")
        err.message ||                  // axios/network error (e.g. "Network Error")
        "Something went wrong";

      console.log("Attendance error:", err.message, err.response?.data);
      Alert.alert("Failed", message);
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