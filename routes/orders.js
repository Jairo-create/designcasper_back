
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const resend = require("../utils/mailer");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

/* ================== HTML EMAIL ================== */

const buildHTML = (customer, items, total, orderNumber) => {

  const rows = items.map(item => `
<tr>
<td style="padding:12px;border-bottom:1px solid #eee;">
<table width="100%">
<tr>

<td width="90">
<img 
src="${item.image ? item.image.replace('/upload/', '/upload/w_120,q_auto,f_auto/') : ''}" 
width="90"
style="border-radius:10px;border:1px solid #ddd;"
/>
</td>

<td style="padding-left:12px;">
<strong>${item.name}</strong>
<br/>
<span style="font-size:12px;">Talle: ${item.size}</span>

<table width="100%" style="margin-top:8px;">
<tr>
<td>Cantidad</td>
<td align="right">${item.quantity}</td>
</tr>

<tr>
<td>Subtotal</td>
<td align="right">$${item.subtotal.toLocaleString("es-AR")}</td>
</tr>

</table>
</td>

</tr>
</table>
</td>
</tr>
`).join("");

  return `
<div style="font-family:Arial;background:#f4f4f4;padding:40px">

<div style="max-width:600px;background:white;margin:auto;padding:20px;border-radius:12px">

<h2>Confirmación de Pedido</h2>

<p>Hola <strong>${customer.name}</strong></p>

<p>Pedido N° <strong>${orderNumber}</strong></p>

<p><strong>Dirección:</strong> ${customer.address}</p>
<p><strong>Ciudad:</strong> ${customer.city}</p>

<table width="100%" style="margin-top:20px;border-collapse:collapse">

<tr style="background:#111;color:white">
<th align="left" style="padding:10px">Detalle del producto</th>
</tr>

${rows}

</table>

<h3 style="text-align:right;margin-top:20px">
Total: $${total.toLocaleString("es-AR")}
</h3>

<p>En breve nos estaremos contactando contigo para confirmar el pedido.</p>

<div style="margin-top:30px;text-align:center">

<img 
src="https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771445696/sxhpz7pkhsqgpfp3peij.png" 
width="90"
/>

</div>

</div>
</div>
`;
};


/* ================== PDF ================== */

const createPDF = (orderData, pdfPath) => {
  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    const { customer, items, total, orderNumber } = orderData;

    doc.fontSize(18).text("Comprobante de Pedido");
    doc.moveDown();

    doc.fontSize(12).text(`Pedido: ${orderNumber}`);
    doc.text(`Cliente: ${customer.name}`);
    doc.text(`Email: ${customer.email}`);
    doc.text(`Teléfono: ${customer.phone}`);
    doc.text(`Dirección: ${customer.address}`);
    doc.text(`Ciudad: ${customer.city}`);

    doc.moveDown();

    for (const item of items) {

      doc.text(`${item.name}`);
      doc.text(`Talle: ${item.size}`);
      doc.text(`Cantidad: ${item.quantity}`);
      doc.text(`Unitario: $${item.unitPriceApplied}`);
      doc.text(`Subtotal: $${item.subtotal}`);

      doc.moveDown();
    }

    doc.moveDown();
    doc.fontSize(14).text(`TOTAL: $${total}`);

    doc.end();

    stream.on("finish", () => {
      resolve();
    });

    stream.on("error", (err) => {
      reject(err);
    });

  });
};


/* ================== GENERAR N° PEDIDO ================== */

const generateOrderNumber = async () => {

  const year = new Date().getFullYear();

  const lastOrder = await Order.findOne().sort({ createdAt: -1 });

  let next = 1;

  if (lastOrder?.orderNumber) {

    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2]);

    next = lastNumber + 1;
  }

  return `SW-${year}-${String(next).padStart(4, "0")}`;
};


/* ================== CHECKOUT ================== */

router.post("/checkout", async (req, res) => {

  try {

    const { customer, items } = req.body;

    if (!customer || !items?.length) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const orderNumber = await generateOrderNumber();

    let totalCalculated = 0;

    const normalizedItems = [];

    for (const item of items) {

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      const unitPriceApplied = item.unitPriceApplied;

      const subtotal = unitPriceApplied * item.quantity;

      totalCalculated += subtotal;

      const imageByColor = product.imagesByColor?.[item.color]?.[0] || null;

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPriceApplied,
        subtotal,
        image: imageByColor
      });
    }

    const order = new Order({
      customer,
      items: normalizedItems,
      total: totalCalculated,
      orderNumber
    });

    await order.save();

    /* ===== GENERAR PDF ===== */

    const ordersDir = "/tmp";

    const pdfPath = path.join(ordersDir, `${orderNumber}.pdf`);

    await createPDF(
      { customer, items: normalizedItems, total: totalCalculated, orderNumber },
      pdfPath
    );

    const pdfBuffer = fs.readFileSync(pdfPath);

    const pdfBase64 = pdfBuffer.toString("base64");

    const html = buildHTML(customer, normalizedItems, totalCalculated, orderNumber);


    /* ===== EMAIL EMPRESA ===== */

    await resend.emails.send({

      from: "Casper Diseños <contacto@dcasper.co>",

      to: "casperdisenos@gmail.com",

      subject: `Nueva Orden - ${orderNumber}`,

      html,

      attachments: [
        {
          filename: "pedido.pdf",
          content: pdfBase64
        }
      ]
    });


    /* ===== EMAIL CLIENTE ===== */

    await resend.emails.send({

      from: "Casper Diseños <contacto@dcasper.co>",

      to: customer.email,

      subject: `Confirmación de Pedido - ${orderNumber}`,

      html,

      attachments: [
        {
          filename: "pedido.pdf",
          content: pdfBase64
        }
      ]
    });


    res.json({ ok: true });

  }

  catch (error) {

    console.error("Error en checkout:", error);

    res.status(500).json({ message: "Error en el servidor" });

  }

});

/* ================== EXPORTAR PEDIDOS DE LOS CLIENTES A EXCEL ================== */

router.get("/export", async (req, res) => {
  try {
    // 1. Buscamos todas las órdenes en la base de datos, de la más reciente a la más antigua
    const orders = await Order.find().sort({ createdAt: -1 });

    // 2. Mapeamos (transformamos) los datos complejos en un formato plano ideal para Excel
    const excelData = orders.map(order => {
      // Unimos todos los productos comprados en un solo texto fácil de leer
      const itemsString = order.items
        .map(i => `${i.quantity}x ${i.name} (Talle: ${i.size}, Color: ${i.color})`)
        .join(" | ");

      return {
        "N° Pedido": order.orderNumber,
        "Fecha": new Date(order.createdAt).toLocaleDateString("es-AR"),
        "Hora": new Date(order.createdAt).toLocaleTimeString("es-AR"),
        "Nombre Cliente": order.customer.name,
        "Teléfono": order.customer.phone,
        "Email": order.customer.email,
        "Dirección": order.customer.address,
        "Ciudad": order.customer.city,
        "Total Pagado ($)": order.total,
        "Tipo de Compra": order.isWholesale ? "Mayorista" : "Detal",
        "Productos": itemsString
      };
    });

    // 3. Creamos el archivo Excel en la memoria (Buffer)
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Pedidos");

    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 4. Configuramos la respuesta para que el navegador inicie una descarga
    res.setHeader("Content-Disposition", "attachment; filename=Pedidos_Casper.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    
    // 5. Enviamos el archivo
    res.send(excelBuffer);

  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    res.status(500).json({ message: "Error al generar el archivo Excel" });
  }
});

//Solo tienes que abrir una pestaña en tu navegador y escribir para descargar los pedidos en EXCEL:
https://designcasper-back.onrender.com/api/orders/export //


module.exports = router;