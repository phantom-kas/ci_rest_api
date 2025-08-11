import { getTracksDb } from "../models/trackModel.js";
import { getDateTime, getPaginationService, standardResponse } from "../utils/utils.js";
import { addInvoiceService, addUserTrack, getInvoiceService, getUserTrack, updateInvoicePayment, updateUserTrackAmount } from "../models/invoiceModel.js";
import { initPackage, verifyPayment } from "../utils/paystackUtls.js";
import { getUserService } from "../models/userModel.js";
import { getPaymentService, updatePayment } from "../models/paymentModel.js";
import db from "../db.js";

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
    const checkInvoice = await getInvoiceService(' user = ? AND track= ? ', 'id', [userId, trackId])
    console.log('checkInvoice', checkInvoice)
    if (checkInvoice.length > 0) {
        return standardResponse(res, 400, undefined, 'User already has an active invoice for this track');
    }
    if (req.body.price) {
        price = req.body.price;
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
    console.log(user)
    const data = await initPackage(next, user[0]['email'], invoice[0]['amount'], {}, id, user[0]['id']);
    console.log('data', data)
    return standardResponse(res, 200, data, undefined, undefined)
}


export const processPaystackPayment = async (req, res, next) => {
    const reference = req.params.reference
    const paymentdata = await verifyPayment(res, reference)
    if (!paymentdata) {
        return standardResponse(res, 500, undefined, 'Payment verification failed');
    }
    const payment = await getPaymentService(' reference = ?', ' id , inovice,status', [reference]);
    if (payment[0]['status'] == 'paid') {
        return standardResponse(res, 400, undefined, 'Payment already processed')
    }
    const invoiceData = await getInvoiceService(' id = ?', 'id,amount,user,track,amount,paid', [payment[0]['inovice']]);

    let status = 'pending';
    //todo: convert amount from ghs to usd
    console.log(invoiceData)
    console.log(payment)
    if (invoiceData[0]['paid'] + paymentdata.data.amount >= invoiceData[0]['amount']) {
        status = 'paid'
    }
    console.log(paymentdata)
    await updatePayment(JSON.stringify(paymentdata), status, getDateTime(), payment[0]['id'])
    await updateInvoicePayment(status, paymentdata.data.amount, getDateTime(), invoiceData[0]['id'])
    await updateUserTrackAmount(status, paymentdata.data.amount, invoiceData[0]['user'], invoiceData[0]['track'])
    return standardResponse(res, 200, undefined, 'Proceeing complete')

}



export const geAllInvoices = async (req, res, next) => {
    const user = req.user
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;
    let invoices
    if (user.role == 'admin') {
        invoices = await getPaginationService(`SELECT i.id,t.name,i.amount, i.paid,i.created_at,i.status,i.last_update ,u.firstName,u.image,u.lastName from invoice as i inner join users as u on i.user = u.id inner join track as t on t.id = i.track `, 'i.id', limit, lastId);
    } else {
        let where = ' AND i.user = ?';
        let params = [req.user.id]
        invoices = await getPaginationService(`SELECT i.id,t.name,i.amount, i.paid,i.created_at,i.status,i.last_update ,u.firstName,u.image,u.lastName from invoice as i inner join users as u on i.user = u.id inner join track as t on t.id = i.track `, 'i.id', limit, lastId, where, params);
    }
    standardResponse(res, 200, invoices)
    return
}


export const deleteInvoice = async (req, res, next) => {
    const id = req.params.id;
    const [result] = await db.query('DELETE FROM invoice WHERE id = ? and paid < 1 LIMIT 1', [id]);
    if (result.affectedRows < 1) {
        return standardResponse(res, 500, undefined, 'Failed to delete invoice');
    }
    return standardResponse(res, 200, undefined, 'Invoice deleted successfully');
}