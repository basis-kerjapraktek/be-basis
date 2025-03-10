const cron = require("node-cron");
const sendEmail = require("../service/sendEmail");
const db = require("../config/dbBasis");

// Jalankan setiap jam (0 * * * *)
cron.schedule("0 * * * *", async () => {
    try {
        const [peminjaman] = await db.query(
            "SELECT id_user, code, tgl_kembali FROM peminjaman WHERE status = 'Dipinjam'"
        );

        const today = new Date();

        for (let item of peminjaman) {
            const batasKembali = new Date(item.tgl_kembali);
            
            if (today > batasKembali) {
                // Ambil email user
                const [user] = await db.query("SELECT email FROM users WHERE id = ?", [item.id_user]);
                
                if (user.length > 0) {
                    await sendEmail(
                        user[0].email,
                        "Pengingat Pengembalian Barang",
                        `Barang dengan ID ${item.code} telah melewati batas peminjaman. Harap segera dikembalikan.`
                    );
                }
            }
        }

        console.log("Cek peminjaman selesai.");
    } catch (error) {
        console.error("Error saat cek peminjaman:", error);
    }
});
