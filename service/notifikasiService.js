const db = require("../config/dbBasis"); // Sesuaikan dengan lokasi dbBasis.js

const insertNotifikasi = async (id_user, tipe, pesan) => {
    try {
        const [result] = await db.query(
            "INSERT INTO notifikasi (id_user, tipe, pesan, status) VALUES (?, ?, ?, 'Belum Dibaca')",
            [id_user, tipe, pesan]
        );
        console.log("Notifikasi berhasil ditambahkan, ID:", result.insertId);
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error("Gagal menambahkan notifikasi:", error);
        throw error;
    }
};

module.exports = { insertNotifikasi };