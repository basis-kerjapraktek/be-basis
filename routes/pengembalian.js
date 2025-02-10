const express = require("express");
const cors = require("cors");
const mysql = require("mysql2"); // Menggunakan mysql2 untuk async queries
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "asset_management",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to database");
  }
});

// Konfigurasi multer untuk upload gambar ke memori sebelum masuk database
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 1. Endpoint untuk mendapatkan semua data pengembalian (tanpa gambar)
 */
app.get("/admin/pengembalian", (req, res) => {
  const query = "SELECT id, id_peminjam, nama, barang, tgl_pinjam, tgl_kembali, status FROM pengembalian";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.json({ message: "Belum ada data pengembalian." });
    }
    res.json(results);
  });
});

/**
 * 2. Endpoint untuk menambahkan data pengembalian (dengan gambar kondisi)
 */
app.post("/admin/pengembalian", upload.single("kondisi"), (req, res) => {
  const { id_peminjam, nama, barang, tgl_pinjam, tgl_kembali, status } = req.body;
  const kondisiImage = req.file ? req.file.buffer : null; // Simpan gambar sebagai buffer

  const query = `
    INSERT INTO pengembalian (id_peminjam, nama, barang, tgl_pinjam, tgl_kembali, kondisi, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [id_peminjam, nama, barang, tgl_pinjam, tgl_kembali, kondisiImage, status], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Data pengembalian berhasil ditambahkan!" });
  });
});

/**
 * 3. Endpoint untuk mengambil gambar kondisi berdasarkan ID
 */
app.get("/admin/pengembalian/kondisi/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT kondisi FROM pengembalian WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0 || !results[0].kondisi) {
      return res.status(404).json({ message: "Gambar kondisi tidak ditemukan." });
    }

    res.setHeader("Content-Type", "image/png"); // Format gambar
    res.send(results[0].kondisi);
  });
});

// Jalankan server
const PORT = PORT;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});