require('dotenv').config(); // Load .env file

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();
const app = express();
const port = 4242;

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json()); // To parse JSON request bodies

// API to create a Stripe customer when a user signs up
app.post('/create-customer', async (req, res) => {
    try {
        const { email, fullName } = req.body;

        const customer = await stripe.customers.create({
            email: email,
            name: fullName
        });

        res.json({ customerId: customer.id });

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// API to create a subscription with a 7-day free trial
app.post('/create-subscription', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            trial_period_days: 7, // 7-day free trial
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({ subscriptionId: subscription.id, clientSecret: subscription.latest_invoice.payment_intent.client_secret });

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Node server listening at http://localhost:${port}/`);
});
