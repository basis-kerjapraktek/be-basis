const express = require("express");
const router = express.Router();
const db = require("../config/dbBasis"); // Menggunakan dbPool dengan promise

// Route untuk mendapatkan semua laporan
router.get("/all", async (req, res) => {
  try {
    const query = "SELECT id_peminjaman, tgl_pinjam, tgl_kembali, kondisi, status FROM laporan_peminjaman";
    
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error("Error fetching laporan: ", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// Route untuk mendapatkan laporan berdasarkan bulan
router.get("/", async (req, res) => {
  let { bulan } = req.query;
  bulan = parseInt(bulan); // Pastikan bulan adalah angka

  try {
    let query = "SELECT id_peminjaman, tgl_pinjam, tgl_kembali, kondisi, status FROM laporan_peminjaman";
    let params = [];

    if (!isNaN(bulan)) {  
      query += " WHERE MONTH(tgl_pinjam) = ?";
      params.push(bulan);
    }

    console.log("Running query:", query, "with params:", params); // Debugging

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error("Error fetching laporan: ", error);
    res.status(500).json({ error: "Database query error" });
  }
});

module.exports = router;
