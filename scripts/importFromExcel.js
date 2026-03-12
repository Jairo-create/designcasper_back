const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

// Configuración
const EXCEL_PATH = "productos.xlsx"; // ajusta la ruta si es necesario
const DRY_RUN = false; // true = no escribe en DB, solo valida ; False = Subida en Mongodb

const ALLOWED_GENDERS = ["hombre", "mujer", "unisex", "niños"];
const REQUIRED_FIELDS = ["name", "category", "gender", "priceWholesale", "priceRetail"];

function normalizeString(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : v;
}

function parseList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function parseBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}

// precio por talle
function parsePricesBySize(v) {
  if (!v) return null;

  if (typeof v === "object") return v;

  try {
    return JSON.parse(v);
  } catch (e) {
    throw new Error("pricesBySize no es JSON válido");
  }
}

function parseImagesByColor(v) {
  if (!v) return {};
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch (e) {
    throw new Error("imagesByColor no es JSON válido");
  }
}

function validateRow(row, rowIndex) {
  const errors = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (row[field] === undefined || row[field] === null || row[field] === "") {
      errors.push(`Falta el campo obligatorio: ${field}`);
    }
  });

  const gender = normalizeString(row.gender);
  if (gender && !ALLOWED_GENDERS.includes(gender)) {
    errors.push(`gender inválido: ${row.gender}. Permitidos: ${ALLOWED_GENDERS.join(", ")}`);
  }

  const pw = Number(row.priceWholesale);
  const pr = Number(row.priceRetail);
  if (Number.isNaN(pw) || pw < 0) errors.push("priceWholesale inválido");
  if (Number.isNaN(pr) || pr < 0) errors.push("priceRetail inválido");

   if (row.pricesBySize) {
  try {
    const prices = parsePricesBySize(row.pricesBySize)

    Object.entries(prices).forEach(([size, price]) => {
      if (typeof price.retail !== "number") {
        errors.push(`pricesBySize.${size}.retail inválido`)
      }

      if (typeof price.wholesale !== "number") {
        errors.push(`pricesBySize.${size}.wholesale inválido`)
      }
    })

  } catch (e) {
    errors.push(e.message)
  }
}
  



  if (row.imagesByColor) {
    try {
      const images = parseImagesByColor(row.imagesByColor);
      // validación básica: que cada color tenga array de URLs
      Object.entries(images).forEach(([color, urls]) => {
        if (!Array.isArray(urls)) {
          errors.push(`imagesByColor.${color} no es un array`);
        }
      });
    } catch (e) {
      errors.push(e.message);
    }
  }

  return errors;
}

async function importFromExcel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`📄 Filas leídas: ${rows.length}`);

    let ok = 0;
    let failed = 0;
    const errorReport = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // considerando header en fila 1

      const errors = validateRow(row, rowIndex);
      if (errors.length) {
        failed++;
        errorReport.push({ row: rowIndex, name: row.name, errors });
        continue;
      }

      // Normalización
      const product = {
        name: String(row.name).trim(),
        category: normalizeString(row.category),
        gender: normalizeString(row.gender),
        priceWholesale: Number(row.priceWholesale),
        priceRetail: Number(row.priceRetail),
        sizes: parseList(row.sizes),
        colors: parseList(row.colors),
        imagesByColor: parseImagesByColor(row.imagesByColor),
        pricesBySize: parsePricesBySize(row.pricesBySize),
        isNew: parseBool(row.isNew),
        isPromo: parseBool(row.isPromo),
      };

      if (!DRY_RUN) {
        // Upsert por name (puedes cambiar a SKU si lo agregas en el futuro)
        await Product.updateOne(
          { name: product.name },
          { $set: product },
          { upsert: true }
        );
      }

      ok++;
    }

    console.log("====================================");
    console.log(`✅ OK: ${ok}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log("====================================");

    if (errorReport.length) {
      console.log("📋 Reporte de errores:");
      errorReport.slice(0, 20).forEach(e => {
        console.log(`Fila ${e.row} (${e.name || "sin nombre"}): ${e.errors.join(" | ")}`);
      });
      if (errorReport.length > 20) {
        console.log(`... y ${errorReport.length - 20} más`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fatal en importador:", error);
    process.exit(1);
  }
}

importFromExcel();