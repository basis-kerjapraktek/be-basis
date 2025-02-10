const mysql = require("mysql2");
const bcrypt = require("bcrypt");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "asset_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};

// Buat koneksi pool dengan promise
const dbPool = mysql.createPool(dbConfig).promise();

// Ekspor dbPool agar bisa digunakan di file lain
module.exports = dbPool;

// Fungsi untuk membuat tabel
async function setupDatabase(db) {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS barang (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(10) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      stock_quantity INT NOT NULL,
      item_condition ENUM('Baik', 'Rusak') NOT NULL,
      status ENUM('Tersedia', 'Kosong') NOT NULL,
      picture LONGBLOB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      role ENUM('Admin', 'Karyawan', 'Atasan') NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS peminjaman (
      id_peminjaman VARCHAR(20) PRIMARY KEY,
      id_user INT,
      id_barang INT,
      tgl_pinjam DATE NOT NULL,
      tgl_kembali DATE NOT NULL,
      status ENUM('Diproses', 'Disetujui', 'Ditolak', 'Dipinjam', 'Dikembalikan') NOT NULL,
      FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (id_barang) REFERENCES barang(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pengembalian (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_peminjaman VARCHAR(20) NOT NULL,
      id_user INT NOT NULL,
      id_barang INT NOT NULL,
      tgl_pinjam DATE NOT NULL,
      tgl_kembali DATE NOT NULL,
      kondisi LONGBLOB, 
      status ENUM('Dikembalikan', 'Terlambat', 'Hilang', 'Rusak') NOT NULL,
      FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE,
      FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (id_barang) REFERENCES barang(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS laporan_peminjaman (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_peminjaman VARCHAR(20) NOT NULL,
      id_user INT NOT NULL,
      id_barang INT NOT NULL,
      tgl_pinjam DATE NOT NULL,
      tgl_kembali DATE NOT NULL,
      kondisi VARCHAR(50) NOT NULL,
      status ENUM('Dipinjam', 'Dikembalikan', 'Terlambat', 'Hilang', 'Rusak') NOT NULL,
      FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE,
      FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (id_barang) REFERENCES barang(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tanggapan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT NOT NULL,
      kategori ENUM('Peminjaman', 'Pengembalian', 'Laporan') NOT NULL,
      status ENUM('Belum dibaca', 'Diproses', 'Selesai') NOT NULL,
      isi_tanggapan TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
    );

  `;

  try {
    await db.query(createTablesQuery);
    console.log("Tables are ready!");
    await seedUsers(db); // Mengisi data awal
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

// Fungsi untuk hashing password
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Fungsi untuk mengisi data awal hanya untuk tabel users
async function seedUsers(db) {
  console.log("Seeding users...");

  const insertUsers = `
    INSERT INTO users (user_id, name, phone, role, email, password)
    VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      name=VALUES(name),
      phone=VALUES(phone),
      role=VALUES(role),
      email=VALUES(email),
      password=VALUES(password);
  `;

  const usersData = [
    'USR-001', 'Admin Basis', '08123456789', 'Admin', 'admin@basis.com', hashPassword('admin123'),
    'USR-002', 'Dika Setiawan', '08987654321', 'Karyawan', 'dika@basis.com', hashPassword('karyawan123'),
    'USR-003', 'Budi Santoso', '08129876543', 'Atasan', 'budi.atasan@basis.com', hashPassword('atasan123')
  ];

  try {
    await db.query(insertUsers, usersData);
    console.log("Users seeded successfully!");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
}

// Menjalankan setup database
setupDatabase(dbPool);