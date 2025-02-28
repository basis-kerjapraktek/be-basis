require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const db = require("./config/dbBasis"); // Sudah menggunakan pool connection dengan .promise()
const barangRoutes = require("./routes/barangRoutes");
const barangControllers = require("./routes/barang");
const peminjaman = require("./routes/peminjaman");
const pengembalian = require("./routes/pengembalian");
const laporan = require("./routes/laporan");
const tanggapanRoutes = require("./routes/tanggapan");
const sendEmail = require("./service/sendEmail");
const peminjamanRoutes = require("./routes/peminjaman");
const notifikasiRoutes = require("./routes/notifikasi");



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/barang", barangRoutes);
app.use("/barang", barangControllers);
app.use("/uploads", express.static("uploads"));

// Gunakan routes barang
app.use("/barang", barangRoutes);

app.use("/peminjaman", peminjaman);

app.use("/pengembalian", pengembalian);

app.use("/laporan", laporan);

app.use("/tanggapan", tanggapanRoutes);

app.use("/peminjaman", peminjamanRoutes);

app.use("/notifikasi", notifikasiRoutes);

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

// Buat endpoint untuk mengirim email notifikasi
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const info = await sendEmail(to, subject, text);
    res.json({ message: "Email berhasil dikirim", response: info.response });
} catch (error) {
    res.status(500).json({ message: "Gagal mengirim email", error: error.message });
  }
});

sendEmail("user@example.com", "Tes Email", "Halo, ini email tes dari sistem!")
    .then(() => console.log("Email terkirim"))
    .catch((err) => console.error("Gagal mengirim email", err));

    console.log("sendEmail function:", sendEmail);


// Endpoint utama
app.get("/", (req, res) => {
  res.send("API berjalan...");
});

require("./cron/cekPeminjaman");

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
