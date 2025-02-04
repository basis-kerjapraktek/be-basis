require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./config/dbBasis"); // Pakai db dari dbBasis.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { id, password } = req.body; // Pakai id, bukan username
  console.log("Login attempt:", id, password);

  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [id], async (err, results) => { // Tambah async di sini
      console.log("Query result:", results);
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.status(401).json({ message: "User not found" });

      const user = results[0];
      console.log("User found:", user);

      const passwordMatch = password === user.password; // Tanpa bcrypt

      console.log("Password match:", passwordMatch);

      if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );

      res.json({ token, role: user.role });
  });
});

app.get("/", (req, res) => {
    res.send("API berjalan...");
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});