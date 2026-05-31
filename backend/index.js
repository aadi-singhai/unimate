const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes will go here later
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const sessionRoutes = require("./routes/session");
app.use("/api/session", sessionRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Unimate Backend is running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});