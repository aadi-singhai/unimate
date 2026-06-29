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
const fetch = require("node-fetch"); // npm install node-fetch@2

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Step 1: Verify credentials via Firebase Auth REST API
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      // Firebase returns errors like INVALID_PASSWORD, EMAIL_NOT_FOUND, etc.
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Step 2: Get their profile from Firestore
    const doc = await db.collection("users").doc(firebaseData.localId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Step 3: Return profile + token
    res.json({
      ...doc.data(),
      idToken: firebaseData.idToken,   // use this for authenticated requests
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;