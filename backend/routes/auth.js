const express = require("express");
const router = express.Router();
const { db, auth } = require("../config/firebase");

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password, name, role, collegeId, deviceId } = req.body;

  const validRoles = ["student", "teacher", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const userRecord = await auth.createUser({ email, password });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      role,
      collegeId,
      deviceId: deviceId || null,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "User registered successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER PROFILE
router.get("/profile/:uid", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN — find user by email and return their profile
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Verify with Firebase Auth
    const userRecord = await auth.getUserByEmail(email);

    // Get their profile from Firestore
    const doc = await db.collection("users").doc(userRecord.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "User profile not found" });

    res.json(doc.data());
  } catch (error) {
    res.status(401).json({ error: "Invalid email or user not found" });
  }
});

module.exports = router;