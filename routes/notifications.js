const express = require("express");
const router = express.Router();
const db = require("../config/dbBasis"); // Koneksi ke database

// ✅ 1. API untuk membuat notifikasi baru
router.post("/add", async (req, res) => {
    const { user_id, type, message } = req.body;
    
    console.log("Data yang diterima:", req.body); // 👈 Cek apakah user_id null atau tidak
  
    if (!user_id) {
      return res.status(400).json({ error: "User ID tidak boleh kosong!" });
    }
  
    try {
      await db.query(
        "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
        [user_id, type, message]
      );
      res.status(201).json({ message: "Notifikasi berhasil ditambahkan!" });
    } catch (error) {
      console.error("Error saat menambahkan notifikasi:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

// ✅ 2. API untuk mendapatkan semua notifikasi berdasarkan user
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [notifications] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil notifikasi!" });
  }
});

// ✅ 3. API untuk menandai notifikasi sebagai sudah dibaca
router.put("/read/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
    res.json({ message: "Notifikasi ditandai sebagai dibaca!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui status notifikasi!" });
  }
});

module.exports = router;
