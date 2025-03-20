require('dotenv').config(); // Load environment variables

const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 10000; // ✅ Use Render-assigned port or default to 10000

// Debugging Logs
console.log(`🚀 Using PORT: ${port}`);
console.log(`✅ Domain: ${process.env.DOMAIN || 'Not Set'}`);

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../client'))); // Serve static files

// Root Route (for testing)
app.get('/', (req, res) => {
    res.send('✅ LuraAI backend is running!');
});

// API: Create Stripe Customer
app.post('/create-customer', async (req, res) => {
    try {
        const { email, fullName } = req.body;
        const customer = await stripe.customers.create({ email, name: fullName });
        res.json({ customerId: customer.id });
    } catch (error) {
        console.error("❌ Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// API: Create Subscription (with 7-day free trial)
app.post('/create-subscription', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            trial_period_days: 7,
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({ subscriptionId: subscription.id, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
    } catch (error) {
        console.error("❌ Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// **Bind to 0.0.0.0 to Ensure External Access**
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is live at http://0.0.0.0:${port}`);
});
