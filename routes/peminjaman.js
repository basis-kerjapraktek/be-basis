const express = require("express");
const { ajukanPeminjaman, setujuiPeminjaman } = require("../controllers/peminjamanControllers");
const router = express.Router();
const db = require("../config/dbBasis"); // Pastikan koneksi database sudah benar

// Endpoint untuk mengambil daftar peminjaman (hanya untuk admin)
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM peminjaman");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route untuk mengajukan peminjaman
router.post("/ajukan", ajukanPeminjaman);

// Route untuk menyetujui atau menolak peminjaman
router.post("/setujui", setujuiPeminjaman);

// Endpoint untuk memperbarui status peminjaman
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Update status di database
    await db.query("UPDATE peminjaman SET status = ? WHERE id_peminjaman = ?", [validasi, id]);

    res.json({ message: "Status peminjaman berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router; // Pastikan ini yang diekspor!