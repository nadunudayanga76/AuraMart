import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    orders.forEach(o => console.log(`ID: ${o._id}, Invoice: ${o.invoiceNumber}, Email: ${o.shippingAddress?.emailAddress}`));
    process.exit(0);
  })
  .catch(console.error);
