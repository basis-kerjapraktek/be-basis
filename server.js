require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./config/dbBasis");
const barangRoutes = require("./routes/barang");
const util = require("util"); // Tambahkan util untuk promisify query

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Promisify db.query agar bisa pakai async/await
const query = util.promisify(db.query).bind(db);

// Login endpoint
app.post("/login", (req, res) => {
  const { user_id, password } = req.body; // Sesuaikan dengan frontend

  console.log("Login attempt:", user_id, password);

  const query = "SELECT * FROM users WHERE user_id = ?";
  db.query(query, [user_id], async (err, results) => {
    console.log("Query result:", results);
    
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "User not found" });

    const user = results[0];
    console.log("User found:", user);

    // Cek password pakai bcrypt.compare
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
  });
});

// Gunakan routes barang
app.use("/barang", barangRoutes);

// Endpoint utama
app.get("/", (req, res) => {
  res.send("API berjalan...");
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
