
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  },

  family: 4 // 🔴 fuerza IPv4 (soluciona ENETUNREACH en Render)
});

module.exports = transporter;