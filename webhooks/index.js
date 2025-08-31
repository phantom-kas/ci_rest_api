import express from 'express';
import { processPayment } from '../controllers/invoiceController.js';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SK);
const BACKEND_SERVICES = {
    gclient_invoice: "https://https://gc-rest-api.onrender.com/api/service/process-paystack",
};
const router = express.Router()
router.post('/paystack', express.json({ type: "*/*" }), async (req, res, next) => {
    const event = req.body;
    console.log('--------------------paystack-webhook------------------------------------------')
    console.log("📩 Received Paystack event:", event.event);
    res.sendStatus(200);
    const backendKey = event.data?.metadata?.backend;
    if (!backendKey || !BACKEND_SERVICES[backendKey]) {
        console.warn("⚠️ No backend assigned for this transaction.");
        return;
    }
    const targetUrl = BACKEND_SERVICES[backendKey];
    switch (event.type) {
        case "charge.success": {
            const ref = event.data.reference;
            return await axios.get(targetUrl + '/' + ref, event, {
                headers: { "Content-Type": "application/json" },
            });
        }
        default:
            console.log(`Unhandled event type: `, event.type);
    }

})

router.post('/stripe', express.raw({ type: "application/json" }), async (req, res, next) => {
    console.log('--------------------stripe-webhook-----------------------------------------')
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SS);
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle events
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            console.log("💰 Checkout session completed:", session.id);
            return await processPayment(session.id, res, next);
        }
        case "charge.succeeded": {
            break
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);

    }
    res.sendStatus(200);
}
)

export default router