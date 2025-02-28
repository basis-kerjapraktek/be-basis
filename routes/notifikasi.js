const express = require("express");
const { tambahNotifikasi, getNotifikasiByUser, bacaNotifikasi } = require("../controllers/notifikasiControllers");
const sendNotificationEmail = require("../service/emailService");

const router = express.Router();

// Endpoint untuk menyimpan notifikasi ke database
router.post("/tambah", tambahNotifikasi);

// Endpoint untuk mengambil semua notifikasi berdasarkan user
router.get("/:id_user", getNotifikasiByUser);

// Endpoint untuk menandai notifikasi sebagai dibaca
router.put("/baca/:id", bacaNotifikasi);

// Endpoint untuk mengirim notifikasi via email
router.post("/send-email", async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({ error: "Data tidak lengkap!" });
    }

    try {
        await sendNotificationEmail(email, subject, message);
        res.status(200).json({ success: "Email notifikasi berhasil dikirim!" });
    } catch (error) {
        res.status(500).json({ error: "Gagal mengirim email notifikasi." });
    }
});

module.exports = router;
