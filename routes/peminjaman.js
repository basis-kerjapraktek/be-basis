const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Konfigurasi koneksi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'asset_management'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Endpoint untuk mengambil daftar peminjaman (hanya untuk admin)
app.get('/admin/peminjaman', (req, res) => {
    const query = 'SELECT * FROM peminjaman';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Jalankan server
const PORT = PORT;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});