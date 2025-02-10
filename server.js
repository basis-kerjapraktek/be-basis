require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./config/dbBasis"); // Sudah menggunakan pool connection dengan .promise()
const barangRoutes = require("./routes/barangRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); 

// Gunakan routes barang
app.use("/barang", barangRoutes);


// Login endpoint
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body; // Sesuaikan dengan frontend

  console.log("Login attempt:", user_id);

  try {
    // Gunakan format yang benar untuk query dengan mysql2 promise
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);

    console.log("Query result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0]; // Ambil user pertama dari hasil query
    console.log("User found:", user);

    if (!user.password) {
      return res.status(500).json({ message: "Password field is missing in database!" });
    }

    // Cek password pakai bcrypt.compare()
    const passwordMatch = await bcrypt.compare(password, user.password);

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint utama
app.get("/", (req, res) => {
  res.send("API berjalan...");
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
