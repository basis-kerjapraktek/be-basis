const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "asset_management"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

app.get("/laporan", (req, res) => {
  const { bulan } = req.query;
  let query = "SELECT * FROM laporan";
  
  if (bulan) {
    query += ` WHERE MONTH(tgl_pinjam) = '${bulan}'`;
  }
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching laporan: ", err);
      res.status(500).json({ error: "Database query error" });
    } else {
      res.json(results);
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});