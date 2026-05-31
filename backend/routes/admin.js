const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const students = await db.collection("users").where("role", "==", "student").get();
    const teachers = await db.collection("users").where("role", "==", "teacher").get();
    const attendance = await db.collection("attendance").get();

    res.json({
      students: students.size,
      teachers: teachers.size,
      attendance: attendance.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
router.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all attendance records
router.get("/attendance", async (req, res) => {
  try {
    const snapshot = await db.collection("attendance").orderBy("markedAt", "desc").get();
    const records = snapshot.docs.map((doc) => doc.data());
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;