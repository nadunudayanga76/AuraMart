import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCartItems } from '../store/cartSlice';
import { addNotification } from '../store/notificationSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

// Use Stripe test publishable key ONLY
const stripePromise = loadStripe('pk_test_51Oxxxxxxxxxxxxxxxxxxxx'); // In a real app, load from env

const CheckoutForm = ({ cartItems, totalAmount, userInfo, shippingAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    // Validate required shipping fields
    const { fullName, emailAddress, address, city, postalCode, country, phone1 } = shippingAddress;
    if (!fullName || !emailAddress || !address || !city || !postalCode || !country || !phone1) {
      setError('Please fill in all required shipping & contact details (marked with *).');
      setProcessing(false);
      return;
    }

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    // Simulate API call to backend to get client secret
    // For demo purposes we simulate a successful payment locally, but we actually create the order!
    setTimeout(async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };

          // Generate PDF Invoice as Base64 to attach to the email
          const orderSnapshotForPdf = {
            orderItems: cartItems,
            shippingAddress,
            user: userInfo,
            itemsPrice: totalAmount,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: totalAmount,
            isPaid: true,
            createdAt: new Date(),
          };
          const invoicePdfBase64 = generateInvoicePDF(orderSnapshotForPdf, true);

          const orderData = {
            orderItems: cartItems.map(item => ({
              product: item._id,
              name: item.name,
              image: item.image,
              price: item.price,
              qty: item.qty
            })),
            shippingAddress: shippingAddress,
            paymentMethod: 'Stripe',
            itemsPrice: totalAmount,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: totalAmount,
            invoicePdfBase64 // Send to backend to email it!
          };

          setProcessing(false);
          setSucceeded(true);
          
          // Get the created order from response to get the invoice number
          const orderRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, orderData, config);
          const newOrder = orderRes.data;

          dispatch(clearCartItems());
          dispatch(addNotification({
            type: 'success',
            title: 'Order Successful',
            message: `Your order ${newOrder.invoiceNumber || 'has been placed'} successfully!`,
          }));

          navigate('/', { state: { paymentSuccess: true } });
          
        } catch (error) {
          console.error(error);
          setError(error.response?.data?.message || 'Payment failed');
          setProcessing(false);
        }
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
          <div className="p-3.5 border border-gray-300 rounded-lg bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <CardNumberElement options={{
              showIcon: true,
              style: {
                base: {
                  fontSize: '15px',
                  color: '#1f2937',
                  fontFamily: '"Inter", sans-serif',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
              },
            }}/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date</label>
            <div className="p-3.5 border border-gray-300 rounded-lg bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <CardExpiryElement options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#1f2937',
                    fontFamily: '"Inter", sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: { color: '#ef4444' },
                },
              }}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
            <div className="p-3.5 border border-gray-300 rounded-lg bg-gray-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <CardCvcElement options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#1f2937',
                    fontFamily: '"Inter", sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: { color: '#ef4444' },
                },
              }}/>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <button
        disabled={processing || succeeded || !stripe}
        className={`w-full py-3 rounded-md font-bold text-white transition ${
          succeeded ? 'bg-green-500' : 'bg-primary hover:bg-red-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {processing ? 'Processing...' : succeeded ? 'Payment Successful!' : `Pay LKR ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return null;
  }

  const itemsAmount = cartItems?.reduce((acc, item) => acc + item.price * item.qty, 0) || 0;
  // Simulating free shipping and 0 tax for now as matching cart page
  const shippingAmount = 0;
  const taxAmount = 0;
  const totalAmount = itemsAmount + shippingAmount + taxAmount;

  const [shippingAddress, setShippingAddress] = useState({
    fullName: userInfo.name || '',
    emailAddress: userInfo.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone1: '',
    phone2: ''
  });

  const handleAddressChange = (e) => {
    setShippingAddress({...shippingAddress, [e.target.name]: e.target.value});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Summary & Secure Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Shipping & Contact Details
              </h3>
              
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="emailAddress" value={shippingAddress.emailAddress} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Shipping Address Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Shipping Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                      <input type="text" name="address" value={shippingAddress.address} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                      <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                      <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                      <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Contact Numbers Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Numbers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Phone <span className="text-red-500">*</span></label>
                      <input type="text" name="phone1" value={shippingAddress.phone1} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Phone <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" name="phone2" value={shippingAddress.phone2} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} userInfo={userInfo} shippingAddress={shippingAddress} />
            </Elements>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 p-8 h-fit">
               <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
               
               <div className="space-y-4 mb-6">
                 {cartItems?.map(item => (
                   <div key={item.cartItemId || item._id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="text-xs text-primary font-medium mt-0.5">
                            Variant: {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-bold text-gray-900">LKR {(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                   </div>
                 ))}
               </div>

               <div className="border-t border-gray-100 pt-6 space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>LKR {itemsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>{shippingAmount === 0 ? 'Free' : `LKR ${shippingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>LKR {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
               </div>

               <div className="border-t border-gray-100 pt-4 flex justify-between items-end mb-8">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary">LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
               </div>
              </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
