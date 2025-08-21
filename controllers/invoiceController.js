import { getTracksDb, updateTrackIncome } from "../models/trackModel.js";
import { getDateTime, getExchangeRate, getPaginationService, standardResponse } from "../utils/utils.js";
import { addInvoiceService, addUserTrack, getInvoiceService, getUserTrack, increaseInvoiceCount, increaseTrackLearners, updateInvoicePayment, updateUserTrackAmount } from "../models/invoiceModel.js";
import { initPackage, verifyPayment } from "../utils/paystackUtls.js";
import { getUserService, increaseLearners } from "../models/userModel.js";
import { getPaymentService, updatePayment, updateTotalIncome } from "../models/paymentModel.js";
import db from "../db.js";
import { generateStripeSesstion, removeProcessingFee, verifyStripePayment } from "../utils/stripeUtils.js";

export const createTrackInvoice = async (req, res, next) => {
    const user = req.user;
    const { trackId } = req.body;
    console.log('user', user)
    let userId = ''
    if (req.user.role == 'admin') {
        userId = req.body.user ?? user.id
    } else {
        userId = user.id
    }
    const trackData = await getTracksDb('price', '  id = ? limit 1 ', [trackId])
    if (trackData.length < 1) {
        return standardResponse(res, 404, undefined, 'Track not found');
    }
    let price = trackData[0].price;
    console.error('--------------------')
    console.error('user = ' + userId)
    console.error('track =' + trackId)
    console.error('-----------------------')
    const checkInvoice = await getInvoiceService(' user = ? AND track= ? AND status != ?', 'id ', [userId, trackId, 'paid'])
    console.log('checkInvoice', checkInvoice)
    if (checkInvoice.length > 0) {
        return standardResponse(res, 400, undefined, 'User already has an active invoice for this track');
    }
    if (req.body.price) {
        price = req.body.price;
        console.log('Price = ', price)
        console.log('Topay = ', trackData[0].price)
        if (price > trackData[0].price) {
            return standardResponse(res, 400, undefined, 'Price cannot be greater than the track price');
        }
    }
    const userTrack = await getUserTrack(userId, trackId, 'amount');
    console.log('userTrack', userTrack)
    if (userTrack) {
        if (userTrack[0]['amount'] + price > trackData[0].price) {
            return standardResponse(res, 400, undefined, 'This payment will exceed the track price');
        }
    } else {
        await addUserTrack(userId, trackId, 0);
        await increaseTrackLearners(trackId,1)
    }
    const invoice = {
        userId,
        trackId: trackId,
        amount: price,
        status: 'pending',
        createdAt: getDateTime(),
        createdBy: user.id
    };
    const invoiceId = await addInvoiceService(invoice);
    await increaseInvoiceCount(1)
    if (!invoiceId) {
        return standardResponse(res, 500, undefined, 'Failed to create invoice');
    }
    return standardResponse(res, 200, { invoiceId }, 'Invoice created successfully');
}


export const payInvoice = async (req, res, next) => {
    const id = req.params.id
    const invoice = await getInvoiceService(' id = ?', 'id,amount,user,status', [id]);
    if (invoice[0]['status'] == 'paid') {
        return standardResponse(res, 400, undefined, 'Invoice already paid');
    }
    const user = await getUserService(invoice[0]['user']);
    // console.log(user)
    const data = await initPackage(next, user[0]['email'], invoice[0]['amount'], {}, id, user[0]['id']);
    //console.log('data', data)
    return standardResponse(res, 200, data, undefined, undefined)
}
export const payInvoiceStripe = async (req, res, next) => {
    console.log('-----------stipe-------------------')
    const id = req.params.id
    const invoice = await getInvoiceService(' id = ?', 'id,amount,user,status,track', [id]);
    if (invoice[0]['status'] == 'paid') {
        return standardResponse(res, 400, undefined, 'Invoice already paid');
    }
    const track = await getTracksDb(' name ', '  id = ? limit 1 ', [invoice[0]['track']]);
    console.log('track', track)
    const user = await getUserService(invoice[0]['user']);
    const data = await generateStripeSesstion(next, track[0]['name'], invoice[0]['amount'], user[0]['id'], id);
    return standardResponse(res, 200, data, undefined, undefined)
}


export const processPaystackPayment = async (req, res, next) => {
    const reference = req.params.reference

    const payment = await getPaymentService(' reference = ?', ' id , inovice,status,amount ,channel ', [reference]);

    if (payment.length < 1) {
        return standardResponse(res, 400, undefined, 'Payment not found')

    }
    if (payment[0]['status'] == 'paid') {
        return standardResponse(res, 400, undefined, 'Payment already processed')
    }

    let rate = 1;
    let paidSoFat = 0;
    let channel = ''
    let amount = 0
    let paymentdata
    if (payment[0]['channel'] == 'paystack') {
        channel = 'paystack'
        paymentdata = await verifyPayment(res, reference)
        if (!paymentdata) {
            return standardResponse(res, 500, undefined, 'Payment verification failed');
        }
        rate = await getExchangeRate('GHS', 'USD');
        amount = Math.ceil(paymentdata.data.amount * (1 / rate))


    } else if (payment[0]['channel'] == 'stripe') {
        channel = 'stripe'
        paymentdata = await verifyStripePayment(res, reference, next)
        if (paymentdata.amount_total < payment[0]['amount']) {
            return standardResponse(res, 200, undefined, ' payment error')
        }
        amount = payment[0]['amount']
        rate = 1
    }

    const invoiceData = await getInvoiceService(' id = ?', 'id,amount,user,track,amount,paid', [payment[0]['inovice']]);
    paidSoFat = parseFloat(invoiceData[0]['paid']) + parseFloat(amount)

    console.log('paymentdata ', amount)
    console.log('paid so far =', paidSoFat)
    console.log('channel =', channel)
    console.log('invoice amount =', invoiceData[0]['amount'])




    let status = 'pending';
    if (paidSoFat >= invoiceData[0]['amount']) {
        status = 'paid'
    }
    await updatePayment(JSON.stringify(paymentdata), status, getDateTime(), payment[0]['id'])
    await updateInvoicePayment(status, amount, getDateTime(), invoiceData[0]['id'])
    await updateUserTrackAmount(status, amount, invoiceData[0]['user'], invoiceData[0]['track'])
    await updateTotalIncome(amount)
    await updateTrackIncome(amount,invoiceData[0]['track'])
    return standardResponse(res, 200, undefined, 'Proceeing complete')
}



export const geAllInvoices = async (req, res, next) => {
    const user = req.user
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;
    let invoices
    let where = '';
    let params = []
    let sql = ''
    if (user.role == 'admin') {
        sql = `SELECT i.id,t.name as track,i.amount, i.paid,i.created_at,i.status,i.last_update ,u.firstName,u.image,u.lastName from invoice as i inner join users as u on i.user = u.id inner join track as t on t.id = i.track `
    } else {
        where = ' AND i.user = ? ';
        params = [req.user.id]
        sql = `SELECT i.id,t.name,i.amount, i.paid,i.created_at,i.status,i.last_update ,u.firstName,u.image,u.lastName from invoice as i inner join users as u on i.user = u.id inner join track as t on t.id = i.track `;
    }
    if (req.query.search != undefined) {
        where += ' and (u.firstName like ? || t.name like ? || u.lastName like ?  || i.status like ?)';
        params.push('%' + req.query.search + '%')
        params.push('%' + req.query.search + '%')
        params.push('%' + req.query.search + '%')
        params.push('%' + req.query.search + '%')
    }
    invoices = await getPaginationService(sql, 'i.id', limit, lastId, where, params);
    standardResponse(res, 200, invoices)
    return
}


export const deleteInvoice = async (req, res, next) => {
    const id = req.params.id;
    const [result] = await db.query('DELETE FROM invoice WHERE id = ? and paid < 1 LIMIT 1', [id]);
    if (result.affectedRows < 1) {
        return standardResponse(res, 500, undefined, 'Failed to delete invoice');
    }
    await increaseInvoiceCount(-1)
    return standardResponse(res, 200, undefined, 'Invoice deleted successfully');
}


export const getInvoiceById = async (req, res, next) => {
    const id = req.params.id;


    const [data] = await db.query(`SELECT  id ,status, amount from invoice where id = ?`, [id])
    if (data.length < 1) {
        return standardResponse(res, 404, undefined, 'Invoice not found');
    }
    return standardResponse(res, 200, data[0])

}