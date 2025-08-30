import express from 'express';
import { processPayment } from '../controllers/invoiceController.js';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SK);

const router = express.Router()
router.post('/paystack', (req, res, next) => {

})

router.post('/stripe', express.raw({ type: "application/json" }), async (req, res,next) => {
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
            return await processPayment(session.id,res,next);

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