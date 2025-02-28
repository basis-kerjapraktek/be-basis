const sendEmail = require("../service/sendEmail");
const db = require("../config/dbBasis");
const { tambahNotifikasi } = require("../controllers/notifikasiControllers");

const ADMIN_EMAIL = "evanaekawijaya140904@gmail.com";

// Fungsi untuk mengajukan peminjaman
const ajukanPeminjaman = async (req, res) => {
    console.log("Body Request:", req.body);
    const { id_user, id_barang, tgl_pinjam, tgl_kembali } = req.body;

    if (!id_user || !id_barang || !tgl_pinjam || !tgl_kembali) {
        return res.status(400).json({ message: "Semua data harus diisi!" });
    }

    try {
        console.log("Memproses peminjaman:", req.body);

        const [result] = await db.query(
            "INSERT INTO peminjaman (id_user, id_barang, tgl_pinjam, tgl_kembali, status) VALUES (?, ?, ?, ?, 'Pending')",
            [id_user, id_barang, tgl_pinjam, tgl_kembali]
        );

        console.log("Peminjaman berhasil disimpan. Menambahkan notifikasi...");
        const id = result.insertId;

        // Menambahkan notifikasi
        try {
            await tambahNotifikasi({ 
                id_user: id_user, 
                tipe: "Permohonan Peminjaman", 
                pesan: `Permohonan peminjaman barang dengan ID ${id_barang} telah diajukan.` 
            });
            console.log("Notifikasi berhasil ditambahkan.");
        } catch (notifError) {
            console.error("Gagal menambahkan notifikasi:", notifError);
            return res.status(500).json({ message: "Gagal menambahkan notifikasi." });
        }

        // Kirim email ke admin
        await sendEmail(
            ADMIN_EMAIL,
            "Permohonan Peminjaman Barang",
            `Ada permohonan peminjaman barang dengan ID ${id_barang} dari user ${id_user}. Silakan periksa sistem.`
        );

        return res.json({ message: "Peminjaman diajukan dan notifikasi dikirim ke admin.", id });
    } catch (error) {
        console.error("Error saat mengajukan peminjaman:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Fungsi untuk menyetujui atau menolak peminjaman
const setujuiPeminjaman = async (req, res) => {
    const { id, status } = req.body;

    try {
        await db.query("UPDATE peminjaman SET status = ? WHERE id = ?", [status, id]);

        // Ambil email dan ID user yang mengajukan peminjaman
        const [user] = await db.query(
            "SELECT u.id, u.email FROM users u JOIN peminjaman p ON u.id = p.id_user WHERE p.id = ?",
            [id]
        );

        if (user.length > 0) {
            try {
                // Tambahkan notifikasi ke user
                await tambahNotifikasi({
                    id_user: user[0].id,
                    tipe: "Status Peminjaman",
                    pesan: `Peminjaman barang dengan ID ${id} telah ${status.toLowerCase()}.`
                });

                console.log("Notifikasi status peminjaman ditambahkan.");
            } catch (notifError) {
                console.error("Gagal menambahkan notifikasi:", notifError);
                return res.status(500).json({ message: "Gagal menambahkan notifikasi." });
            }

            // Kirim email ke user
            await sendEmail(
                user[0].email,
                "Status Peminjaman Barang",
                `Permohonan peminjaman barang Anda telah ${status.toLowerCase()}.`
            );
        }

        // Kirim email ke admin
        await sendEmail(
            ADMIN_EMAIL,
            "Pembaruan Status Peminjaman",
            `Peminjaman dengan ID ${id} telah ${status.toLowerCase()}.`
        );

        res.json({ message: `Peminjaman ${status.toLowerCase()} dan notifikasi dikirim.` });
    } catch (error) {
        console.error("Error saat memperbarui peminjaman:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

module.exports = { ajukanPeminjaman, setujuiPeminjaman };