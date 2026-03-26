
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   MIDDLEWARES
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://desingcasper.netlify.app",
      "http://192.168.0.8:5173",
      "https://dcasper.co",
      "https://www.dcasper.co"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  })
);

app.use(express.json());

/* =========================
   RUTAS
========================= */

app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/images", express.static("public/images"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/auth", require("./routes/auth"));

/* =========================
   BASE DE DATOS
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB conectada"))
  .catch((err) => console.log("❌ Error MongoDB:", err));

/* =========================
   PUERTO
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});