
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB conectada"))
  .catch(err => console.log(err));

/* =========================
   PUERTO
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});