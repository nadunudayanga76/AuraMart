import React, { useState } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !email) {
      setError('Please enter both Order ID and Email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrderData(null);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/track`, { orderId, email });
      setOrderData(data);
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : 'Something went wrong. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0; // Cancelled or unknown
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Track Your Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order ID and the email address you used during checkout to see the current status of your package.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Tracking Form */}
          <div className={`w-full transition-all duration-500 ${orderData ? 'lg:w-1/3' : 'max-w-2xl mx-auto'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <form onSubmit={handleTrack} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 64b2c123abc456..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter the email used for the order"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-[#e60047] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <><FiSearch size={18} /> Track Order</>
                  )}
                </button>
              </form>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <FiAlertCircle size={18} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Tracking Results */}
          {orderData && (
            <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Order #{orderData._id.substring(0, 8)}</p>
                  <p className="text-gray-900 font-bold">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Amount</p>
                  <p className="text-gray-900 font-bold">Rs. {orderData.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="p-6 md:p-10">
                {/* Timeline Progress */}
                <div className="relative max-w-3xl mx-auto mb-16 mt-8">
                  {orderData.deliveryStatus === 'Cancelled' ? (
                    <div className="text-center text-red-500 font-bold flex flex-col items-center gap-3">
                      <FiAlertCircle size={48} />
                      <span className="text-xl">Order Cancelled</span>
                      <p className="text-gray-500 font-normal text-sm">Please contact support for more information.</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((getStatusStep(orderData.deliveryStatus) - 1) / 2) * 100}%` }}
                      ></div>
                      
                      <div className="relative z-10 flex justify-between">
                        {/* Step 1: Processing */}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${getStatusStep(orderData.deliveryStatus) >= 1 ? 'bg-green-500 border-green-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                            <FiClock size={20} strokeWidth={3} />
                          </div>
                          <span className={`text-sm font-bold ${getStatusStep(orderData.deliveryStatus) >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${getStatusStep(orderData.deliveryStatus) >= 2 ? 'bg-green-500 border-green-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                            <FiTruck size={20} strokeWidth={3} />
                          </div>
                          <span className={`text-sm font-bold ${getStatusStep(orderData.deliveryStatus) >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</span>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${getStatusStep(orderData.deliveryStatus) >= 3 ? 'bg-green-500 border-green-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                            <FiCheckCircle size={20} strokeWidth={3} />
                          </div>
                          <span className={`text-sm font-bold ${getStatusStep(orderData.deliveryStatus) >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiPackage className="text-primary" /> Items in this Shipment
                  </h3>
                  <div className="space-y-4">
                    {orderData.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-50" />
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <div className="font-bold text-gray-900">
                          Rs. {(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
