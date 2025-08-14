import Stripe from 'stripe';
import { createPaymnet } from '../models/paymentModel.js';
const stripe = Stripe(process.env.STRIPE_SK);
export const getprocessingFee = (amount) => {
    const fee = Math.ceil((parseFloat(amount) * 0.029) + 0.3);
    return fee;
}

export const generateStripeSesstion = async (next, name, price, user, invoice) => {
    let processingFee = getprocessingFee(price);
    console.log('Total fee = ' ,price)
    console.log('Procefing fee = ' ,processingFee)
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [
            {
                price_data: {
                    currency: 'USD',
                    product_data: {
                        name: name,
                    },
                    unit_amount: Math.ceil(parseFloat(price + '')),
                },
                quantity: 1
            },
            {
                price_data: {
                    currency: 'usd',
                    product_data: { 'name': 'Stripe Processing Fee' },
                    'unit_amount': processingFee,
                },
                'quantity': 1,
            },
        ],
        mode: 'payment',
        // return_url: ``,
        redirect_on_completion: 'never'
    });
    await createPaymnet(price, session.id, 'incomplete', invoice, 'iv', user, 'stripe')
    return { 'client_secret': session.client_secret, 'sessionid': session.id, 'pk': process.env.STRIPE_PK };
}



export const verifyStripePayment = async (res, sessionId,next) => {

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('---------------SESSION-----------------')
        console.log(session)
        console.log('---------------SESSION-----------------')
        if (session.status != 'complete') {
            // Handle successful payment
            return false
        } else {
            return session
        }
    } catch (error) {
        console.error('Error verifying Stripe payment:', error);
        next(error);
    }
}


// export const removeProcessingFee = (total) => {
//     const numTotal = parseFloat(total);
//     if (isNaN(numTotal)) return 0;
//     return parseFloat(((numTotal - 0.3) / 1.029).toFixed(2));
// };

export const removeProcessingFee = (totalWithFee) => {
   const totalInCents = Math.round(totalWithFee * 100);
    const baseInCents = Math.round((totalInCents - 30) * (1 - 0.029));
    return baseInCents / 100;
};