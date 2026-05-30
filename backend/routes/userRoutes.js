import express from 'express';
import { registerUser, verifyOTP, loginUser, googleLogin, getUsers, updateUserBan, deleteUser, getWishlist, toggleWishlist } from '../controllers/authController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/', protect, admin, getUsers);
router.put('/:id/ban', protect, admin, updateUserBan);
router.delete('/:id', protect, admin, deleteUser);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, toggleWishlist);

export default router;
