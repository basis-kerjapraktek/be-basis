const db = require("../config/dbBasis");

// Tambah notifikasi baru
const tambahNotifikasi = async ({ id_user, tipe, pesan }) => {
    console.log("Menambahkan notifikasi:", { id_user, tipe, pesan });

    if (!id_user || !tipe || !pesan) {
        console.log("Data notifikasi tidak lengkap!", { id_user, tipe, pesan });
        throw new Error("Data tidak lengkap!");
    }

    try {
        const [result] = await db.query(
            "INSERT INTO notifikasi (id_user, tipe, pesan, status) VALUES (?, ?, ?, 'Belum Dibaca')",
            [id_user, tipe, pesan]
        );

        console.log("Notifikasi berhasil ditambahkan, ID:", result.insertId);
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error("Gagal menambahkan notifikasi:", error);
        throw new Error("Gagal menambahkan notifikasi.");
    }
};

const getNotifikasiByUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const sql = "SELECT * FROM notifikasi WHERE id_user = ? ORDER BY created_at DESC";
        const [rows] = await db.execute(sql, [id_user]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan", error });
    }
};

const bacaNotifikasi = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "UPDATE notifikasi SET status = 'Dibaca' WHERE id = ?";
        await db.execute(sql, [id]);
        res.json({ message: "Notifikasi telah dibaca" });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan", error });
    }
};

module.exports = { tambahNotifikasi, getNotifikasiByUser, bacaNotifikasi };