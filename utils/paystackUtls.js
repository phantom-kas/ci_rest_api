import dotenv from 'dotenv';
import { encrypt, getExchangeRate, standardResponse } from './utils.js';
import { createPaymnet } from '../models/paymentModel.js';
import axios from 'axios';
dotenv.config();

export const initPackage = async (next, email, amount, metadata, invoice, user, currency = 'GHS') => {
    try {
        //todo: convert amount from usd to ghs
        let rate = await getExchangeRate('GHS')
        let amt = Math.ceil(parseInt(parseInt(amount) * rate))
        console.log('amount', amt)
        console.log('rate', rate)
        const { data } = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amt,
                currency,
                // callback_url: "http://localhost:3000/payment-success", // optional
                //metadata: encryptedData
                "metadata": {
                    "service": "gclient_invoice"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        // console.log(data.data)
        const reference = data.data.reference
        await createPaymnet(amount, reference, 'incomplete', invoice, 'iv', user, 'paystack')
        return data.data
    }
    catch (error) {
        // console.log('Error initializing payment:', error);
        next()
    }
}


export const verifyPayment = async (reference) => {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });
    if (response.data.data.status != 'success') {
        //  standardResponse(res, 500, undefined, 'Payment not successful');
        // console.log(response.data)
        return false;
    }
    return response.data
}