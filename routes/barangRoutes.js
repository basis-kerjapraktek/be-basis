const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const app = express();
const db = require("../config/dbBasis");

app.use("/uploads", express.static("uploads"));

// Konfigurasi Multer untuk menyimpan gambar di folder uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Simpan di folder uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Buat nama unik
  },
});

const upload = multer({ storage: storage });

// Endpoint untuk menambah barang
router.post("/", upload.single("picture"), async (req, res) => {
  try {
    const { code, name, stock_quantity, item_condition, status } = req.body;
    const picture = req.file ? req.file.filename : null; // Simpan nama file

    if (!code || !name || !stock_quantity || !picture) {
      return res.status(400).json({ message: "Harap isi semua kolom!" });
    }

    const query = `
      INSERT INTO barang (code, name, stock_quantity, item_condition, status, picture) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [code, name, stock_quantity, item_condition, status, picture]);

    res.json({ message: "Barang berhasil ditambahkan!" });
  } catch (error) {
    console.error("Error saat menyimpan barang:", error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

//Endpoint untuk mengambil barang
router.get("/", async (req, res) => {
  try {
    const [barang] = await db.query("SELECT * FROM barang ORDER BY id DESC");
    
    // Ubah setiap item agar `picture` menjadi URL lengkap
    const updatedBarang = barang.map(item => ({
      ...item,
      picture: item.picture ? `http://localhost:3000/uploads/${item.picture}` : null
    }));

    res.json(updatedBarang);
  } catch (error) {
    console.error("Error saat mengambil barang:", error);
    res.status(500).json({ message: "Gagal mengambil data barang" });
  }
});

// Endpoint untuk mengedit barang
router.put("/:id", upload.single("picture"), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, stock_quantity, item_condition, status } = req.body;
    const picture = req.file ? req.file.filename : null; // Ambil gambar baru jika ada

    // Cek apakah barang dengan ID tersebut ada
    const [existingBarang] = await db.query("SELECT * FROM barang WHERE id = ?", [id]);
    if (existingBarang.length === 0) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    // Jika ada gambar baru, update dengan gambar baru, jika tidak pakai gambar lama
    const updatedPicture = picture || existingBarang[0].picture;

    // Gunakan kondisi yang sudah ada jika `item_condition` tidak dikirim
    const updatedItemCondition = item_condition !== undefined ? item_condition : existingBarang[0].item_condition;

    // Update barang di database
    const query = `
      UPDATE barang 
      SET code = ?, name = ?, stock_quantity = ?, item_condition = ?, status = ?, picture = ? 
      WHERE id = ?
    `;
    await db.query(query, [code, name, stock_quantity, updatedItemCondition, status, updatedPicture, id]);

    res.json({ message: "Barang berhasil diperbarui!" });
  } catch (error) {
    console.error("Error saat mengedit barang:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat memperbarui barang" });
  }
});

// Endpoint untuk mengambil data barang berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [barang] = await db.query("SELECT * FROM barang WHERE id = ?", [id]);

    if (barang.length === 0) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    const updatedBarang = {
      ...barang[0],
      picture: barang[0].picture ? `http://localhost:3000/uploads/${barang[0].picture}` : null
    };

    res.json(updatedBarang);
  } catch (error) {
    console.error("Error saat mengambil barang:", error);
    res.status(500).json({ message: "Gagal mengambil data barang" });
  }
});




module.exports = router;