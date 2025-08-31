import express from 'express';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { createInvoiceSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { createTrackInvoice, deleteInvoice, geAllInvoices, getInvoiceById, payInvoice, payInvoiceStripe, processPaystackPayment } from '../controllers/invoiceController.js';
import { getExchangeRate, standardResponse } from '../utils/utils.js';

const router = express.Router()
router.post('/invoice/track', authenticateAtoken, (req, res, next) => validateUserRequest(req, res, next, createInvoiceSchema), createTrackInvoice)
router.get('/init-paystack/:id', authenticateAtoken, payInvoice)
router.get('/init-stripe/:id', authenticateAtoken, payInvoiceStripe)
router.get('/invoice/:id', authenticateAtoken, getInvoiceById)
router.get('/process-paystack/:reference', authenticateAtoken, processPaystackPayment)
router.get('/service/process-paystack/:reference', processPaystackPayment)
router.get('/invoices', authenticateAtoken, geAllInvoices)
router.get('/ghs_rate', authenticateAtoken, async(req, res, next)=> standardResponse(res,200,await getExchangeRate('GHS', 'USD')))
router.delete('/invoice/:id', authenticateAtoken,adminProtected, deleteInvoice);

export default router
