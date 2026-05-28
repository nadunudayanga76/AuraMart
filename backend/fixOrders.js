import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection('orders').updateMany({}, { $set: { isPaid: true, paidAt: new Date() } });
  console.log('Updated all orders to Paid');
  process.exit(0);
});
