const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "asset_management",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database!");
  setupDatabase(); // Jalankan setup tabel
});

// Fungsi untuk membuat tabel
function setupDatabase() {
  // Tabel Barang
  const createBarangTable = `
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
  `;

  // Tabel Users
  const createUsersTable = `
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
  `;

  db.query(createBarangTable, (err) => {
    if (err) {
      console.error("Error creating table `barang`:", err);
    } else {
      console.log("Table `barang` ready to use!");
    }
  });

  db.query(createUsersTable, (err) => {
    if (err) {
      console.error("Error creating table `users`:", err);
    } else {
      console.log("Table `users` ready to use!");
    }
  });

  setTimeout(seedDatabase, 2000); // Jalankan seed data setelah 2 detik
}

// Fungsi untuk mengisi data awal
function seedDatabase() {
  console.log("Seeding database...");

  // Seed data untuk users
  const insertUsers = `
    INSERT INTO users (user_id, name, phone, role, email, password)
    VALUES
      ('USR-001', 'Admin Basis', '08123456789', 'Admin', 'admin@basis.com', 'admin123'),
      ('USR-002', 'Dika Setiawan', '08987654321', 'Karyawan', 'dika@basis.com', 'karyawan123'),
      ('USR-003', 'Budi Santoso', '08129876543', 'Atasan', 'budi.atasan@basis.com', 'atasan123')
    ON DUPLICATE KEY UPDATE name=name;
  `;

  // Seed data untuk barang
  const insertBarang = `
    INSERT INTO barang (code, name, stock_quantity, item_condition, status)
    VALUES
      ('BRG-001', 'Laptop Dell', 5, 'Baik', 'Tersedia'),
      ('BRG-002', 'Monitor LG', 3, 'Baik', 'Tersedia'),
      ('BRG-003', 'Mouse Logitech', 10, 'Baik', 'Tersedia')
    ON DUPLICATE KEY UPDATE name=name;
  `;

  db.query(insertUsers, (err) => {
    if (err) {
      console.error("Error inserting users:", err);
    } else {
      console.log("Users seeded successfully!");
    }
  });

  db.query(insertBarang, (err) => {
    if (err) {
      console.error("Error inserting barang:", err);
    } else {
      console.log("Barang seeded successfully!");
    }
  });
}

module.exports = db;