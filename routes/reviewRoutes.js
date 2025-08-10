import express from 'express';
import { authenticateAtoken } from '../middleware/auth.js';
import { reviewSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { createReview, getReviews } from '../controllers/reviewController.js';

const router = express.Router()
router.post('/create_review', (req, res, next) => validateUserRequest(req, res, next, reviewSchema), authenticateAtoken, createReview);

router.get('/reviews', authenticateAtoken, getReviews)
export default router
