const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Gunakan host Gmail
            port: 465, // Gunakan 465 untuk SSL, atau 587 untuk TLS
            secure: true, // true jika menggunakan port 465, false untuk 587
            auth: {
                user: process.env.EMAIL_USER, // Pastikan App Password dipakai
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Menghindari error self-signed certificate
            },
        });

        let info = await transporter.sendMail({
            from: `"Notifikasi Sistem" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
        });

        console.log("Email berhasil dikirim: " + info.response);
        return info;
    } catch (error) {
        console.error("Error mengirim email:", error);
        throw error;
    }
};

// Pastikan diekspor dengan benar
module.exports = sendEmail;