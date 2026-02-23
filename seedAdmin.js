
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI);

async function seedAdmin() {
  const hashed = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "ligia.39alarcon@gmail.com",
    password: hashed
  });

  console.log("Admin creado");
  process.exit();
}

seedAdmin();