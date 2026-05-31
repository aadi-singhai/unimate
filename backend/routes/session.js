const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// College config — update these values
const COLLEGE_IP_RANGE = "192.168.1"; // first 3 parts of your college WiFi IP
// const COLLEGE_LAT = 22.7196;          // your college GPS latitude
// const COLLEGE_LNG = 75.8577;          // your college GPS longitude
// const COLLEGE_RADIUS_METERS = 200;    // allowed radius around college
const QR_EXPIRY_MS = 10 * 1000;       // 10 seconds

// Helper: check if IP is in college range
const isCollegeIP = (ip) => {
  if (!ip) return false;
  return ip.startsWith(COLLEGE_IP_RANGE);
};

// Helper: calculate distance between two GPS points in meters
// const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
//   const R = 6371000;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

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

  // Get student's IP from request
  const studentIP =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  // Layer 1: SSID check
  if (ssid !== process.env.COLLEGE_WIFI_SSID) {
    return res.status(403).json({ error: "You must be on college WiFi." });
  }

  // Layer 2: IP range check
  if (!isCollegeIP(studentIP)) {
    console.log("IP check failed:", studentIP);
    // Note: in development/local testing, comment out this check
    // return res.status(403).json({ error: "Your IP is not from college network." });
  }

  // Layer 3: GPS check
  // if (latitude && longitude) {
  //   const distance = getDistanceMeters(latitude, longitude, COLLEGE_LAT, COLLEGE_LNG);
  //   if (distance > COLLEGE_RADIUS_METERS) {
  //     return res.status(403).json({ error: `You are too far from college (${Math.round(distance)}m away).` });
  //   }
  // } else {
  //   return res.status(403).json({ error: "Location is required to mark attendance." });
  // }

  try {
    // Layer 4: Validate session
    const sessionDoc = await db.collection("sessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found." });
    }

    const session = sessionDoc.data();

    // Layer 5: Check expiry (10 seconds)
    if (Date.now() > session.expiresAt) {
      return res.status(400).json({ error: "QR code has expired. Ask teacher to regenerate." });
    }

    // Layer 6: Check device ID matches registered device
    const studentDoc = await db.collection("users").doc(studentUid).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: "Student not found." });
    }

    const studentData = studentDoc.data();
    if (studentData.deviceId && studentData.deviceId !== deviceId) {
      return res.status(403).json({ error: "Device not recognized. Use your registered phone." });
    }

    // Layer 7: Already marked check
    const alreadyMarked = await db
      .collection("attendance")
      .where("sessionId", "==", sessionId)
      .where("studentUid", "==", studentUid)
      .get();

    if (!alreadyMarked.empty) {
      return res.status(400).json({ error: "Attendance already marked." });
    }

    // Layer 8: One mark per IP per session
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
      deviceId,
      deviceIP: studentIP,
      latitude,
      longitude,
      markedAt: Date.now(),
      status: "present",
    });

    res.json({ message: "Attendance marked successfully ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;