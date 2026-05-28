import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getPublicStats = async (req, res) => {
  try {
    // Get total counts
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    
    // For brands, we can distinct them
    const brands = await Product.distinct('brand');
    const brandsCount = brands.length;

    res.json({
      customers: usersCount,
      brands: brandsCount,
      orders: ordersCount,
      years: 5 // Static for now, or based on company launch date
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
};
