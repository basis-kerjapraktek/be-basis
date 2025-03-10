const express = require("express");
const multer = require("multer");
const db = require("../config/dbBasis"); // Pastikan path sesuai dengan struktur proyek

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 1. Endpoint untuk mendapatkan semua data pengembalian (tanpa gambar)
 */
router.get("/", async (req, res) => {
  try {
    const query = "SELECT id, id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, status FROM pengembalian";
    
    const [results] = await db.query(query);

    if (results.length === 0) {
      return res.json({ message: "Belum ada data pengembalian." });
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Endpoint untuk menambahkan data pengembalian (dengan gambar kondisi)
 */
router.post("/", upload.single("kondisi"), async (req, res) => {
  try {
    const { id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, kondisi, status } = req.body;
    const kondisiImage = req.file ? req.file.buffer : null;

    const query = `
      INSERT INTO pengembalian (id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, kondisi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, kondisi, status]);

    res.status(201).json({ message: "Data pengembalian berhasil ditambahkan!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Endpoint untuk mengambil gambar kondisi berdasarkan ID
 */
router.get("/kondisi/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [results] = await db.query("SELECT kondisi FROM pengembalian WHERE id = ?", [id]);

    if (results.length === 0 || !results[0].kondisi) {
      return res.status(404).json({ message: "Gambar kondisi tidak ditemukan." });
    }

    res.setHeader("Content-Type", "image/png");
    res.send(results[0].kondisi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
