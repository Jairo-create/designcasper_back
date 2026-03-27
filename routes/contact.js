
const express = require("express");
const router = express.Router();
const resend = require("../utils/mailer"); // Importamos Resend igual que en las órdenes

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validación básica en el servidor
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    /* ===== EMAIL DE CONTACTO ===== */
    await resend.emails.send({
      from: "Casper Diseños <contacto@dcasper.co>", // Debe salir desde tu dominio verificado
      to: "casperdisenos@gmail.com", // La bandeja donde quieres leer el mensaje
      reply_to: email, // 🔥 CLAVE: Si le das "Responder" en Gmail, le responderá directo al cliente
      subject: `Nuevo mensaje de la web - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Nuevo mensaje de contacto
          </h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email del cliente:</strong> ${email}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; margin-top: 20px;">
            <p style="margin: 0;"><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });

    res.json({ ok: true, message: "Correo enviado exitosamente" });

  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    res.status(500).json({ message: "Error en el servidor al enviar el correo" });
  }
});

module.exports = router;