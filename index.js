require("dotenv").config(); // ✅ at the top
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const email = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

exports.sendPaymentEmailToShopper = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  if (!before || !after) return null;
  if (before.status === "paid" || after.status !== "paid") return null;

  const shopperSnap = await admin.firestore().collection("shoppers").doc(after.shopperId).get();
  const shopper = shopperSnap.data();
  const toEmail = shopper?.email;

  if (!toEmail) return null;

  await transporter.sendMail({
    from: `Commercio <${email}>`,
    to: toEmail,
    subject: "💰 Client Payment Received",
    text: `Hi ${shopper.name || "Shopper"}, your client has paid for order ${event.params.orderId}. You may proceed with delivery.`,
  });

  console.log("✅ Email sent to", toEmail);
  return null;
});
