import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create Admin User
    const adminUser = await User.create({
      name: 'AuraMart Admin',
      email: 'admin@auramart.com',
      password: 'adminpassword',
      isAdmin: true,
    });

    const adminId = adminUser._id;

    // Create Sample Products
    const sampleProducts = [
      {
        user: adminId,
        name: 'Minimalist White Leather Watch',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        brand: 'ClassicTime',
        category: 'Accessories',
        description: 'A beautiful white leather minimalist watch with premium materials and precise quartz movement. Perfect for any occasion.',
        rating: 4.8,
        numReviews: 24,
        price: 36000,
        discountedPrice: 27000,
        countInStock: 15,
      },
      {
        user: adminId,
        name: 'Premium Wireless Noise-Cancelling Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
        brand: 'SoundLux',
        category: 'Electronics',
        description: 'Immerse yourself in rich, high-fidelity sound. Features active noise cancellation, 30 hours of battery life, and comfortable memory foam ear cups.',
        rating: 4.9,
        numReviews: 42,
        price: 90000,
        discountedPrice: 75000,
        countInStock: 8,
      },
      {
        user: adminId,
        name: 'Red Athletic Running Sneakers',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
        brand: 'AirFit',
        category: 'Fashion',
        description: 'Ultralight performance running shoes designed for ultimate speed, flexibility, and impact absorption. Breathable mesh upper keep your feet cool.',
        rating: 4.5,
        numReviews: 18,
        price: 15000,
        discountedPrice: 11000,
        countInStock: 25,
      },
      {
        user: adminId,
        name: 'Retro Round Sunglasses',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60',
        brand: 'ShadeCo',
        category: 'Accessories',
        description: 'Vintage style round sunglasses featuring durable acetate frame and high definition UV400 protective polarized lenses.',
        rating: 4.7,
        numReviews: 31,
        price: 5500,
        discountedPrice: 4000,
        countInStock: 40,
      },
      {
        user: adminId,
        name: 'Vintage Instant Polaroid Camera',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
        brand: 'Polaroid',
        category: 'Electronics',
        description: 'Capture instant memories with this classic vintage Polaroid camera. Easy point-and-shoot design with built-in flash.',
        rating: 4.6,
        numReviews: 12,
        price: 20000,
        discountedPrice: 16000,
        countInStock: 5,
      },
      {
        user: adminId,
        name: 'Minimalist Premium Cotton T-Shirt',
        image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=500&auto=format&fit=crop&q=60',
        brand: 'ThreadWorks',
        category: 'Fashion',
        description: 'Crafted from 100% long-staple organic cotton. Exceptionally soft, lightweight, and tailored for a modern look that lasts.',
        rating: 4.4,
        numReviews: 56,
        price: 4500,
        discountedPrice: 3500,
        countInStock: 100,
      }
    ];

    await Product.insertMany(sampleProducts);

    console.log('Data Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
