const nodemailer = require("nodemailer");

// Konfigurasi transport email (gunakan App Password dari Google)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evanaekawijaya14@gmail.com", // Email pengirim
    pass: "twng kldy onid fbxh", // Gunakan App Password dari Google
  },
});

// Fungsi untuk mengirim email notifikasi
const sendNotificationEmail = async (to, subject, message) => {
  try {
    let info = await transporter.sendMail({
      from: '"Sistem Peminjaman Asset" <evanaekawijaya14@gmail.com>',
      to: to, 
      subject: subject, 
      text: message,
      html: `<p>${message}</p>`,
    });

    console.log("Email berhasil dikirim: " + info.response);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
  }
};

// Ekspor fungsi agar bisa digunakan di file lain
module.exports = sendNotificationEmail;
