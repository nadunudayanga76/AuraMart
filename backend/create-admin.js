import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@auramart.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Update existing admin to make sure isAdmin is true
      existingAdmin.isAdmin = true;
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin
      await User.create({
        name: 'AuraMart Admin',
        email: adminEmail,
        password: 'admin123',
        isAdmin: true,
        avatar: '',
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║     ADMIN LOGIN CREDENTIALS          ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  Email:    admin@auramart.com         ║');
    console.log('║  Password: admin123                   ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
