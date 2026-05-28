import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  createPaymentIntent,
  getOrders,
  updateDeliveryStatus,
  deleteOrder,
  trackOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliverystatus').put(protect, admin, updateDeliveryStatus);
router.route('/track').post(trackOrder);

// Stripe Test Mode Payment Intent Route
router.route('/create-payment-intent').post(protect, createPaymentIntent);

export default router;
