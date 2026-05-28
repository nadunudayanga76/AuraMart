import express from 'express';
import {
  getProducts,
  getFlashSaleProducts,
  getProductById,
  createProduct,
  updateProduct,
  createProductReview,
  contactSeller,
  getAllReviews,
  deleteReview,
  deleteProduct
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/flash-sale').get(getFlashSaleProducts);
router.route('/reviews/all').get(protect, admin, getAllReviews);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, admin, deleteReview);
router.route('/:id/contact').post(contactSeller);

export default router;
