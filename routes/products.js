
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middlewares/auth");


// OBTENER TODOS lOS PRODUCTOS
router.get("/", async (req, res) => {
  try {
    const { gender, category, isNew, isPromo } = req.query;

    let filter = {};

    if (gender) {
      filter.gender = gender.toLowerCase();
    }

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (isNew === "true") {
      filter.isNew = true;
    }

    if (isPromo === "true") {
      filter.isPromo = true;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

/* ===== PRODUCTO POR ID ===== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener producto" });
  }
});

 

// CREAR PRODUCTO (ADMIN)
router.post("/", auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando producto" });
  }
});


module.exports = router;