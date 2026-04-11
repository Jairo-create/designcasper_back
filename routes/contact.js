const express = require("express");
const router = express.Router();
const resend = require("../utils/mailer");
const multer = require("multer"); // 🔥 1. Importamos la nueva herramienta

//  2. Configuramos multer para leer el archivo en la memoria RAM (sin guardarlo en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Límite estricto de 5MB por seguridad del servidor
});

// 3. Añadimos el middleware "upload.single('attachment')" a la ruta
// Esto le dice a Express que intercepte un archivo llamado "attachment" antes de ejecutar tu código
router.post("/", upload.single("attachment"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body; // Multer ya separó los textos aquí

    // Validación básica
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // 4. Preparamos el "paquete" del correo base (sin enviar todavía)
    const emailData = {
      from: "Casper Diseños <contacto@dcasper.co>",
      to: "casperdisenos@gmail.com",
      reply_to: email, 
      subject: `Nuevo mensaje de la web - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Nuevo mensaje de contacto
          </h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email del cliente:</strong> ${email}</p>
          <p><strong>Teléfono/WhatsApp:</strong> ${phone}</p> 
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; margin-top: 20px;">
            <p style="margin: 0;"><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    };

    //  5. Si el cliente envió un archivo, Multer lo pondrá en "req.file"
    if (req.file) {
      emailData.attachments = [
        {
          filename: req.file.originalname, // Mantiene el nombre original (ej. "diseño.png")
          content: req.file.buffer // Resend toma el archivo crudo desde la memoria directamente
        }
      ];
    }

    // 6. Ahora sí, disparamos el correo
    await resend.emails.send(emailData);

    res.json({ ok: true, message: "Correo enviado exitosamente" });

  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    res.status(500).json({ message: "Error en el servidor al enviar el correo" });
  }
});

module.exports = router;