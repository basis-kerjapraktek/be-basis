const mysql = require("mysql2");

// Koneksi ke database MySQL (gunakan pool agar lebih stabil)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "asset_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Periksa koneksi database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database Connection Error:", err);
  } else {
    console.log("Connected to MySQL Database!");
    connection.release();
  }
});

// Ambil semua barang
const getAllBarang = (req, res) => {
  db.query("SELECT * FROM barang", (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }
    res.json(result);
  });
};

// Ambil barang berdasarkan ID
const getBarangById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM barang WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }
    res.json(result[0]);
  });
};

// Tambah barang baru
const addBarang = (req, res) => {
  const { code, name, stock_quantity, item_condition, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!code || !name || !stock_quantity || !item_condition || !status) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  const sql =
    "INSERT INTO barang (code, name, stock_quantity, item_condition, status, picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
  
  db.query(
    sql,
    [code, name, stock_quantity, item_condition, status, picture],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Gagal menyimpan data", error: err });
      }
      res.json({ message: "Barang berhasil ditambahkan!", data: result });
    }
  );
};

module.exports = { getAllBarang, getBarangById, addBarang };