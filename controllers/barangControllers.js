const db = require("../config/dbBasis"); // Sesuaikan dengan konfigurasi database kamu

exports.getBarang = (req, res) => {
    res.json({ message: "List Barang" });
};

exports.deleteBarang = async (req, res) => {  // Perbaiki di sini (pakai exports)
    try {
        const { id } = req.params;

        // Contoh hapus data dari database (MySQL, MongoDB, dll.)
        const result = await db.Barang.destroy({ where: { id } });  // Pastikan Barang ada di db

        if (result) {
            res.json({ message: "Barang berhasil dihapus" });
        } else {
            res.status(404).json({ message: "Barang tidak ditemukan" });
        }
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan", error });
    }
};
