const express = require('express');
const router = express.Router();
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Your secret Stripe key

router.post('/payments', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { paymentMethodId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe accepts payments in the smallest currency unit, like cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});

module.exports = router;
