const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// College config — update these values
const COLLEGE_IP_RANGE = "10.210.171"; // first 3 parts of your college WiFi IP
const QR_EXPIRY_MS = (parseInt(process.env.QR_EXPIRY_SECONDS) || 60) * 1000; // default 60 seconds

// Helper: check if IP is in college range
const isCollegeIP = (ip) => {
  if (!ip) return false;
  return ip.startsWith(COLLEGE_IP_RANGE);
};

// TEACHER: Create session and get QR
router.post("/create", async (req, res) => {
  const { teacherUid, subject, classId, roomId } = req.body;

  if (!teacherUid || !subject || !classId || !roomId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const sessionId = uuidv4();
    const expiresAt = Date.now() + QR_EXPIRY_MS;

    await db.collection("sessions").doc(sessionId).set({
      sessionId,
      teacherUid,
      subject,
      classId,
      roomId,
      expiresAt,
      createdAt: Date.now(),
      active: true,
    });

    const qrData = JSON.stringify({ sessionId, classId, roomId });
    const qrImage = await QRCode.toDataURL(qrData);

    res.json({ sessionId, expiresAt, qrImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STUDENT: Mark attendance
router.post("/mark", async (req, res) => {
  const { sessionId, studentUid, ssid, deviceId, latitude, longitude } = req.body;

  // Get student's IP from request and strip IPv6 prefix
  const rawIP =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";
  const studentIP = rawIP.replace(/^::ffff:/, "");

  // Layer 1: SSID check
  if (process.env.COLLEGE_WIFI_SSID && ssid !== process.env.COLLEGE_WIFI_SSID) {
    return res.status(403).json({ error: "You must be on college WiFi." });
  }

  // Layer 2: IP range check (log only, not blocking in dev)
  if (!isCollegeIP(studentIP)) {
    console.log("IP check failed:", studentIP);
  }

  try {
    // Layer 3: Validate session
    const sessionDoc = await db.collection("sessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found." });
    }

    const session = sessionDoc.data();

    // Layer 4: Check expiry
    if (Date.now() > session.expiresAt) {
      return res.status(400).json({ error: "QR code has expired. Ask teacher to regenerate." });
    }

    // Layer 5: Check device ID matches registered device
    const studentDoc = await db.collection("users").doc(studentUid).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: "Student not found." });
    }

    const studentData = studentDoc.data();
    if (studentData.deviceId && studentData.deviceId !== deviceId) {
      return res.status(403).json({ error: "Device not recognized. Use your registered phone." });
    }

    // Layer 6: Already marked check
    const alreadyMarked = await db
      .collection("attendance")
      .where("sessionId", "==", sessionId)
      .where("studentUid", "==", studentUid)
      .get();

    if (!alreadyMarked.empty) {
      return res.status(400).json({ error: "Attendance already marked." });
    }

    // Layer 7: One mark per IP per session
    const sameIP = await db
      .collection("attendance")
      .where("sessionId", "==", sessionId)
      .where("deviceIP", "==", studentIP)
      .get();

    if (!sameIP.empty) {
      return res.status(403).json({ error: "Another student already marked from this network location." });
    }

    // All checks passed — mark attendance
    await db.collection("attendance").add({
      sessionId,
      studentUid,
      subject: session.subject,
      classId: session.classId,
      roomId: session.roomId,
      teacherUid: session.teacherUid,
      deviceId: deviceId || null,
      deviceIP: studentIP,
      latitude: latitude || null,
      longitude: longitude || null,
      markedAt: Date.now(),
      status: "present",
    });

    res.json({ message: "Attendance marked successfully ✅" });
  } catch (error) {
    console.log("Mark attendance error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;