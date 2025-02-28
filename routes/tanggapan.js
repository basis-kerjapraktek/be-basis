const express = require("express");
const router = express.Router();
const db = require("../config/dbBasis"); // Menggunakan pool dengan promise

// Endpoint untuk mendapatkan daftar tanggapan dengan filter status
router.get("/", async (req, res) => {
    try {
        const { status } = req.query;
        let query = "SELECT * FROM tanggapan";
        let params = [];

        if (status) {
            query += " WHERE status = ?";
            params.push(status);
        }

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error("Error fetching tanggapan:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint untuk melihat detail tanggapan berdasarkan ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("SELECT * FROM tanggapan WHERE id = ?", [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Tanggapan tidak ditemukan" });
        }

        res.json(result[0]);
    } catch (err) {
        console.error("Error fetching tanggapan detail:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
