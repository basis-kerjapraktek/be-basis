const express = require("express");
const multer = require("multer");
const { getAllBarang, getBarangById, addBarang } = require("../routes/barang");

const router = express.Router();

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Data diterima dari frontend:", req.body);
    console.log("File yang diterima:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "Gambar harus diunggah!" });
    }

    const { code, name, stock_quantity, item_condition, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO barang (code, name, stock_quantity, item_condition, status, picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    const [result] = await db.query(sql, [code, name, stock_quantity, item_condition, status, image]);

    console.log("Barang berhasil disimpan:", result);
    res.json({ message: "Barang berhasil ditambahkan!", data: result });

  } catch (error) {
    console.error("Error saat menambahkan barang:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server", error: error.message });
  }
});


// Endpoint GET: Ambil semua barang
router.get("/", getAllBarang);

// Endpoint GET: Ambil barang berdasarkan ID
router.get("/:id", getBarangById);

// Endpoint POST: Tambah barang baru
router.post("/", upload.single("image"), addBarang);

module.exports = router;