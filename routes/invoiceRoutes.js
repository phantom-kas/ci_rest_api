import express from 'express';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { createInvoiceSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { createTrackInvoice, deleteInvoice, geAllInvoices, payInvoice, processPaystackPayment } from '../controllers/invoiceController.js';

const router = express.Router()
router.post('/invoice/track', authenticateAtoken, (req, res, next) => validateUserRequest(req, res, next, createInvoiceSchema), createTrackInvoice)
router.get('/init-paystack/:id', authenticateAtoken, payInvoice)
router.get('/process-paystack/:reference', authenticateAtoken, processPaystackPayment)
router.get('/invoices', authenticateAtoken, geAllInvoices)
router.delete('/invoice/:id', authenticateAtoken,adminProtected, deleteInvoice);

export default router
