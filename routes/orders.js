
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const transporter = require("../utils/mailer");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");




/* ================== HTML EMAIL ================== */
const buildHTML = (customer, items, total, orderNumber) => {
  const rows = items.map(item => `
   <tr>
  <td style="padding:12px; border-bottom:1px solid #eee;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="90" valign="top">
          <img 
            src="${item.image ? item.image.replace('/upload/', '/upload/w_120,q_auto,f_auto/') : ''}" 
            width="90"
            style="border-radius:10px; border:1px solid #ddd; display:block;"
          />
        </td>
        <td valign="top" style="padding-left:12px;">
          <strong style="font-size:15px; line-height:1.3; display:block;">
            ${item.name}
          </strong>
          <span style="font-size:12px; color:#393939; display:block; margin-top:2px;">
            Talle: ${item.size}
          </span>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            <tr>
              <td style="font-size:12px; color:#393939;">Cantidad</td>
              <td align="right" style="font-size:12px; color:#1f1e1e;                     ">${item.quantity}</td>
            </tr>
            <tr>
              <td style="font-size:12px; color:#393939;">Subtotal</td>
              <td align="right" style="font-size:12px; color:#1f1e1e;">
                $${item.subtotal.toLocaleString("es-AR")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
`).join("");

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; padding:40px;">
    <div style="max-width:600px; width:100%; background:white; margin:auto; padding:20px; border-radius:12px; box-sizing:border-box;">
      <h2>Confirmación de Pedido</h2>
      <p>Hola <strong>${customer.name}</strong></p>
      <p>Pedido N° <strong>${orderNumber}</strong></p>
      <p><strong>Dirección de envío:</strong> ${customer.address}</p>
      <p><strong>Ciudad:</strong> ${customer.city}</p>

     <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:20px;">
       <tr style="background:#111; color:white;">
         <th align="left" style="padding:10px;">Detalle del producto</th>
       </tr>
       ${rows}
     </table>

      <h3 style="text-align:right; margin-top:20px;">
        Total: $${total.toLocaleString("es-AR")}
      </h3>

      <p>En breve nos estaremos contactando contigo para confirmar el pedido.</p>
      <p>Recuerda que nuestro horario de atención es de Lun-Vier 7am - 6pm ; Sábado 7am - 2pm.</p>

      <div style="margin-top:30px; text-align:center;">
        
        <img 
          src="https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771445696/sxhpz7pkhsqgpfp3peij.png" 
          width="90"
          alt="Logo Casper"
        />
      </div>
    </div>
  </div>`;
};

 /* ================== PDF ================== */

  

  const createPDF = async (orderData, pdfPath) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(pdfPath));

  const { customer, items, total, orderNumber } = orderData;

  // Logo
  const logoPath = path.join(__dirname, "../assets/Log_casper.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 100 });
  }

  doc
    .fontSize(18)
    .text("Comprobante de Pedido", 200, 50, { align: "right" })
    .fontSize(10)
    .text(`Pedido: ${orderNumber}`, 200, 75, { align: "right" });

  doc.moveDown(4);

  doc.fontSize(12).text(`Cliente: ${customer.name}`);
  doc.text(`Email: ${customer.email}`);
  doc.text(`Teléfono: ${customer.phone}`);
  doc.text(`Dirección de envío: ${customer.address}`);
  doc.text(`Ciudad: ${customer.city}`);

  doc.moveDown(2);

  // Cabecera tabla
  const tableTop = doc.y;
  doc.fontSize(11).text("Producto", 50, tableTop);
  doc.text("Cant.", 250, tableTop);
  doc.text("Unitario", 320, tableTop);
  doc.text("Subtotal", 420, tableTop);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  for (const item of items) {
    const y = doc.y + 10;

    doc.fontSize(10).text(item.name, 50, y, { width: 180 });
    doc.text(item.quantity.toString(), 250, y);
    doc.text(`$${item.unitPriceApplied.toLocaleString("es-AR")}`, 320, y);
    doc.text(`$${item.subtotal.toLocaleString("es-AR")}`, 420, y);

    doc.moveDown(2);
  }

  doc.moveDown();
  doc.fontSize(14).text(`TOTAL: $${total.toLocaleString("es-AR")}`, { align: "right" });

  doc.end();
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

const downloadImage = require("../utils/downloadImage");

router.post("/checkout", async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !items?.length) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const orderNumber = await generateOrderNumber();

    let totalCalculated = 0;

    const normalizedItems = [];

    const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
    const isWholesale = totalUnits >= 3;

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

    // 📁 PDF
    const ordersDir = path.join(__dirname, "../orders");
    if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir);

    const pdfPath = path.join(ordersDir, `${orderNumber}.pdf`);
    await createPDF(
     { customer, items: normalizedItems, total: totalCalculated, orderNumber },
     pdfPath
    );

    const html = buildHTML(customer, normalizedItems, totalCalculated, orderNumber);

    

    // 📩 MAIL EMPRESA
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: "casperdisenos@gmail.com",
      subject: `Nueva Orden - ${orderNumber}`,
      html,
      attachments: [{ filename: "pedido.pdf", path: pdfPath }]
    });

    // 📩 MAIL CLIENTE
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: customer.email,
      subject: `Confirmación de Pedido - ${orderNumber}`,
      html,
      attachments: [{ filename: "pedido.pdf", path: pdfPath }]
    });

    res.json({ ok: true });

  } catch (error) {
    console.error("Error en checkout:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;