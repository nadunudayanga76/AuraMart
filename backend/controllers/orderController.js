import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';
import sendEmail from '../utils/sendEmail.js';

export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    invoicePdfBase64,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    // Generate a unique invoice number
    const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      invoiceNumber,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();

    // Auto-deduct stock and increment orders count
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        let variantUpdated = false;
        if (product.variants && product.variants.length > 0) {
          const variantIndex = product.variants.findIndex(v => 
            (item.selectedColor ? v.color === item.selectedColor : !v.color) && 
            (item.selectedSize ? v.size === item.selectedSize : !v.size)
          );
          if (variantIndex !== -1) {
            product.variants[variantIndex].countInStock -= item.qty;
            if (product.variants[variantIndex].countInStock < 0) product.variants[variantIndex].countInStock = 0;
            variantUpdated = true;
            // Recalculate total product countInStock
            product.countInStock = product.variants.reduce((acc, v) => acc + (Number(v.countInStock) || 0), 0);
          }
        }
        
        if (!variantUpdated) {
          product.countInStock = product.countInStock - item.qty;
          if (product.countInStock < 0) product.countInStock = 0;
        }

        product.orders = (product.orders || 0) + item.qty;
        await product.save();
      }
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e11d48; text-align: center;">AuraMart Order Confirmation</h2>
        <p>Dear <strong>${shippingAddress.fullName || req.user.name}</strong>,</p>
        <p>Thank you for your purchase! Your order has been successfully placed. Your order ID is <strong>${createdOrder._id}</strong>.</p>
        <p>Your Invoice Number is: <strong>${createdOrder.invoiceNumber}</strong></p>
        
        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Summary</h3>
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  ${item.name}
                  ${(item.selectedColor || item.selectedSize) ? `<div style="font-size: 0.85em; color: #666; margin-top: 4px;">Variant: ${[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}</div>` : ''}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">LKR ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3 style="text-align: right; color: #111827;">Total: LKR ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
        
        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Shipping & Contact Details</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
        <p style="margin: 5px 0;"><strong>Primary Phone:</strong> ${shippingAddress.phone1}</p>
        ${shippingAddress.phone2 ? `<p style="margin: 5px 0;"><strong>Secondary Phone:</strong> ${shippingAddress.phone2}</p>` : ''}
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280; text-align: center;">We will contact you shortly regarding your delivery. Thank you for shopping with AuraMart!</p>
      </div>
    `;

    // Send email asynchronously without blocking the response
    const trackingEmail = shippingAddress.emailAddress || req.user.email;
    const attachments = [];
    if (invoicePdfBase64) {
      attachments.push({
        filename: `Invoice_${createdOrder.invoiceNumber}.pdf`,
        content: invoicePdfBase64.split("base64,")[1],
        encoding: 'base64'
      });
    }

    sendEmail({
      email: trackingEmail,
      subject: `Order Confirmation - #${createdOrder._id.toString().substring(0, 8).toUpperCase()}`,
      html: emailHtml,
      attachments
    });

    res.status(201).json(createdOrder);
  }
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.deliveryStatus = req.body.deliveryStatus || order.deliveryStatus;
    
    if (req.body.deliveryStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      order.isDelivered = false;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// Stripe Test Mode Payment Intent
export const createPaymentIntent = async (req, res) => {
  // MUST USE TEST KEYS. We assume process.env.STRIPE_SECRET_KEY is a sk_test_... key
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email');
  res.json(orders);
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      if (req.user.isAdmin || req.user._id.toString() === order.user.toString()) {
        await order.deleteOne();
        res.json({ message: 'Order/Invoice removed successfully' });
      } else {
        res.status(401).json({ message: 'Not authorized to delete this order' });
      }
    } else {
      res.status(404).json({ message: 'Order/Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Track an order by ID and Email
// @route   POST /api/orders/track
// @access  Public
export const trackOrder = async (req, res) => {
  let { orderId, email } = req.body;
  if (orderId) orderId = orderId.trim();
  if (email) email = email.trim();

  if (!orderId || !email) {
    return res.status(400).json({ message: 'Please provide both Order ID and Email Address' });
  }

  try {
    let order;
    
    // Check if the provided orderId is a valid 24-character MongoDB ObjectId
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId).populate('user', 'email');
    }
    
    // If not found by ID (or not a valid ID format), try searching by invoiceNumber
    if (!order) {
      order = await Order.findOne({ invoiceNumber: { $regex: new RegExp(`^${orderId}$`, 'i') } }).populate('user', 'email');
    }
    
    if (order) {
      // Check if the provided email matches the shipping address email OR the registered user's email
      const isEmailMatch = 
        (order.shippingAddress && order.shippingAddress.emailAddress && order.shippingAddress.emailAddress.toLowerCase() === email.toLowerCase()) ||
        (order.user && order.user.email && order.user.email.toLowerCase() === email.toLowerCase());

      if (isEmailMatch) {
        res.json({
          _id: order._id,
          createdAt: order.createdAt,
          deliveryStatus: order.deliveryStatus,
          isPaid: order.isPaid,
          totalPrice: order.totalPrice,
          orderItems: order.orderItems,
          shippingAddress: order.shippingAddress
        });
      } else {
        res.status(401).json({ message: 'Email address does not match our records for this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Invalid Order ID format or Server Error' });
  }
};
