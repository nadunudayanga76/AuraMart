import express from 'express';
import { getInquiries, replyToInquiry, deleteInquiry } from '../controllers/inquiryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getInquiries);
router.route('/:id').delete(protect, admin, deleteInquiry);
router.route('/:id/reply').post(protect, admin, replyToInquiry);

export default router;
