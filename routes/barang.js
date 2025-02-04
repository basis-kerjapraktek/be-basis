const express = require("express");
const router = express.Router();
const db = require("../config/dbBasis"); // Koneksi ke database

// Get semua barang
router.get("/", (req, res) => {
    db.query("SELECT * FROM barang", (err, results) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        res.json(results);
    });
});

module.exports = router;
