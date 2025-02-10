const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Sesuaikan dengan password database kamu
    database: "sistem_peminjaman"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: ", err);
        return;
    }
    console.log("Connected to database");
});

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error("Error creating table: ", err);
    } else {
        console.log("Table 'tanggapan' is ready");
    }
});

// Endpoint untuk mendapatkan daftar tanggapan dengan filter status
app.get("/tanggapan", (req, res) => {
    const { status } = req.query;
    let query = "SELECT * FROM tanggapan";
    if (status) {
        query += " WHERE status = ?";
    }
    db.query(query, [status], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint untuk melihat detail tanggapan
app.get("/tanggapan/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM tanggapan WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Tanggapan tidak ditemukan" });
        }
        res.json(result[0]);
    });
});

// Menjalankan server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
