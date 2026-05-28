import express from 'express';
const router = express.Router();
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.route('/:slug').get(getCategoryBySlug);
router.route('/:id').put(protect, admin, updateCategory).delete(protect, admin, deleteCategory);

export default router;
