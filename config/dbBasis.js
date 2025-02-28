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
      picture VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    ALTER TABLE barang MODIFY picture VARCHAR(255);


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
      kondisi VARCHAR(255), 
      status ENUM('Dikembalikan', 'Terlambat', 'Hilang', 'Rusak') NOT NULL,
      validasi ENUM('Disetujui', 'Ditolak') DEFAULT NULL,
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
      user_id VARCHAR(20) NOT NULL,
      kategori ENUM('Sistem', 'Barang', 'Kebijakan') NOT NULL,
      status ENUM('Belum dibaca', 'Diproses', 'Selesai') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifikasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT NOT NULL,
      tipe VARCHAR(255), -- misal: "peminjaman", "pengembalian", dll.
      pesan TEXT NOT NULL,
      status ENUM('baru', 'dibaca') DEFAULT 'baru', -- Untuk melacak apakah notifikasi sudah dibaca
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

  const insertPeminjaman = `
    INSERT INTO peminjaman (id_peminjaman, id_user, id_barang, nama, barang, tgl_pinjam, tgl_kembali, status)
    VALUES
      ('PMJ-001', 2, 1, 'Adi Sumanto', 'Laptop Asus Zenbook Pro', '2025-02-01', '2025-02-05', 'Dipinjam'),
      ('PMJ-002', 2, 2, 'Budi Pamulang', 'Laptop Asus Zenbook Pro', '2025-02-02', '2025-02-06', 'Dikembalikan'),
      ('PMJ-003', 3, 3, 'Camelia Okta', 'Mouse Roboto', '2025-02-03', '2025-02-07', 'Dipinjam'),
      ('PMJ-004', 3, 4, 'Karin Angelia', 'Monitor Dell', '2025-02-04', '2025-02-08', 'Diproses'),
      ('PMJ-005', 2, 5, 'Wawan Kurniawan', 'Laptop Hp', '2025-02-05', '2025-02-09', 'Ditolak')
    ON DUPLICATE KEY UPDATE status=VALUES(status);
  `;

//   const insertPengembalian = `
//   INSERT INTO pengembalian (id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, kondisi, status)
//   VALUES
//       ('PMJ-002', 2, 55, '2025-02-02', '2025-02-06', '/uploads/1739154716797.png', 'Dikembalikan'),
//       ('PMJ-003', 3, 56, '2025-02-03', '2025-02-07', '/uploads/1739154716798.png', 'Dikembalikan'),
//       ('PMJ-004', 3, 57, '2025-02-04', '2025-02-08', '/uploads/1739154716799.png', 'Terlambat')
//   ON DUPLICATE KEY UPDATE 
//       status = VALUES(status), 
//       kondisi = VALUES(kondisi);
// `;


//   const insertLaporan = `
//   INSERT INTO laporan_peminjaman (id_peminjaman, id_user, id_barang, tgl_pinjam, tgl_kembali, kondisi, status)
//   VALUES
//       ('PMJ-002', 2, 55, '2025-02-02', '2025-02-06', 'Baik', 'Dikembalikan'),
//       ('PMJ-003', 3, 56, '2025-02-03', '2025-02-07', 'Rusak', 'Dikembalikan'),
//       ('PMJ-004', 3, 57, '2025-02-04', '2025-02-08', 'Baik', 'Diproses')
// `;

// const insertTanggapan = `
// INSERT INTO tanggapan (user_id, kategori, status, created_at, updated_at) VALUES
//   ('USR-001', 'Sistem', 'Belum dibaca', NOW(), NOW()),
//   ('USR-002', 'Barang', 'Diproses', NOW(), NOW()),
//   ('USR-003', 'Kebijakan', 'Selesai', NOW(), NOW()),
//   ('USR-001', 'Barang', 'Belum dibaca', NOW(), NOW()),
//   ('USR-002', 'Sistem', 'Selesai', NOW(), NOW()),
//   ('USR-003', 'Barang', 'Diproses', NOW(), NOW()),
//   ('USR-001', 'Kebijakan', 'Selesai', NOW(), NOW()),
//   ('USR-002', 'Barang', 'Belum dibaca', NOW(), NOW()),
//   ('USR-003', 'Sistem', 'Diproses', NOW(), NOW()),
//   ('USR-001', 'Kebijakan', 'Selesai', NOW(), NOW())
// `;

  


  try {
    await db.query(insertUsers, usersData);
    await db.query(insertPeminjaman);
    // await db.query(insertPengembalian);
    // await db.query(insertLaporan);
    // await db.query(insertTanggapan);
    console.log("Data seeded successfully!");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
}

// Menjalankan setup database
setupDatabase(dbPool);