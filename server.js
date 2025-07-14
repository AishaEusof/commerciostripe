// server.js
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config(); // Load .env

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use Stripe secret key from .env file
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🧾 Create Payment Intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // amount in sen (example: RM10 = 1000)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'myr',
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).send({ error: err.message });
  }
});

// 🚀 Start server
const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Stripe server running on http://localhost:${PORT}`);
});
