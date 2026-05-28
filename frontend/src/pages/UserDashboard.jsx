import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { saveShippingAddress } from '../store/cartSlice';

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/orders') return 'orders';
    if (location.pathname === '/profile') return 'profile';
    return 'orders';
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { shippingAddress } = useSelector((state) => state.cart);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: shippingAddress?.fullName || userInfo?.name || '',
    emailAddress: shippingAddress?.emailAddress || userInfo?.email || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    postalCode: shippingAddress?.postalCode || '',
    country: shippingAddress?.country || '',
    phone1: shippingAddress?.phone1 || '',
    phone2: shippingAddress?.phone2 || ''
  });

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(addressForm));
    setIsEditingAddress(false);
  };

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/myorders`, config);
        // Sort orders by newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoadingOrders(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoadingOrders(false);
      }
    };
    if (userInfo) {
      fetchMyOrders();
    }
  }, [userInfo]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderParam = searchParams.get('order');

    if (location.pathname === '/orders') {
      setActiveTab('orders');
    } else if (location.pathname === '/profile') {
      if (!orderParam && activeTab === 'orders') {
        setActiveTab('profile'); // Default to profile if coming from orders
      }
    }

    if (orderParam) {
      setActiveTab('orders');
      setExpandedOrderId(orderParam);
      
      // Optionally remove the query param from URL without refreshing
      // window.history.replaceState(null, '', location.pathname);
    }
  }, [location]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`, config);
        setOrders(orders.filter(order => order._id !== orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete the order.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 text-center bg-gray-50">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-3 shadow-sm border-2 border-white">
                  {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{userInfo?.name || 'User'}</h3>
                <p className="text-sm text-gray-500">{userInfo?.email}</p>
              </div>
              <nav className="flex flex-col">
                <button 
                  onClick={() => navigate('/orders')}
                  className={`px-6 py-4 text-left border-l-4 font-medium transition ${activeTab === 'orders' ? 'border-primary bg-blue-50 text-primary' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                >
                  Order History
                </button>
                <button 
                  onClick={() => { setActiveTab('profile'); navigate('/profile'); }}
                  className={`px-6 py-4 text-left border-l-4 font-medium transition ${activeTab === 'profile' ? 'border-primary bg-blue-50 text-primary' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                >
                  Profile Settings
                </button>
                <button 
                  onClick={() => { setActiveTab('addresses'); navigate('/profile'); }}
                  className={`px-6 py-4 text-left border-l-4 font-medium transition ${activeTab === 'addresses' ? 'border-primary bg-blue-50 text-primary' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                >
                  Manage Addresses
                </button>
                <button 
                  className="px-6 py-4 text-left border-l-4 border-transparent text-red-600 font-medium hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    My Orders
                  </h3>
                  
                  {loadingOrders ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h4>
                      <p className="text-gray-500 text-sm">Looks like you haven't placed an order yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white">
                          
                          {/* Order Header (Always Visible) */}
                          <div 
                            className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                            onClick={() => toggleOrderExpand(order._id)}
                          >
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Invoice / Order ID</p>
                                <p className="font-bold text-primary">{order.invoiceNumber || `INV-${order._id.substring(0,6).toUpperCase()}`}</p>
                              </div>
                              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Date Placed</p>
                                <p className="font-bold text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="font-bold text-gray-900">LKR {order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.isPaid ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                {order.isPaid ? 'Paid' : 'Pending Payment'}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                                className="text-red-500 hover:text-red-700 transition bg-red-50 hover:bg-red-100 w-8 h-8 rounded-full shadow flex items-center justify-center"
                                title="Delete Order"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                              <button className="text-gray-500 hover:text-primary transition bg-white w-8 h-8 rounded-full shadow flex items-center justify-center">
                                <svg className={`w-5 h-5 transform transition-transform ${expandedOrderId === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded Order Details */}
                          {expandedOrderId === order._id && (
                            <div className="p-6 border-t border-gray-100 animate-fade-in-up">
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                {/* Shipping Details */}
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Shipping & Contact Information
                                  </h4>
                                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1">
                                    <p><span className="font-bold text-gray-800">Name:</span> {order.shippingAddress.fullName || userInfo.name}</p>
                                    <p><span className="font-bold text-gray-800">Email:</span> {order.shippingAddress.emailAddress || userInfo.email}</p>
                                    <p><span className="font-bold text-gray-800">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                                    <p><span className="font-bold text-gray-800">Phone 1:</span> {order.shippingAddress.phone1}</p>
                                    {order.shippingAddress.phone2 && <p><span className="font-bold text-gray-800">Phone 2:</span> {order.shippingAddress.phone2}</p>}
                                  </div>
                                </div>

                                {/* Order Date & Time */}
                                <div className="md:col-span-2 lg:col-span-1 border border-gray-100 rounded-xl p-5 shadow-sm bg-blue-50/30">
                                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Order Date & Time
                                  </h4>
                                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                      </p>
                                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                                        {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Order Summary
                                  </h4>
                                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                      <span>Items Total:</span>
                                      <span>LKR {order.itemsPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                      <span>Shipping:</span>
                                      <span>LKR {order.shippingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                      <span>Tax:</span>
                                      <span>LKR {order.taxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                                      <span>Grand Total:</span>
                                      <span className="text-primary">LKR {order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                  Items Ordered ({order.orderItems.length})
                                </h4>
                                <div className="space-y-4">
                                  {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-sm text-gray-900 truncate">{item.name}</h5>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                          <span>Qty: {item.qty}</span>
                                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900">LKR {(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-xs text-gray-500 mt-1">LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} each</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile Settings
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <form className="max-w-xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            </div>
                            <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" defaultValue={userInfo?.name || ''} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                            <input type="email" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" defaultValue={userInfo?.email || ''} readOnly />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-100 mt-8">
                         <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                           Security & Password
                         </h4>
                         <div className="space-y-4">
                            <input type="password" placeholder="Current Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input type="password" placeholder="New Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
                              <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
                            </div>
                         </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <button type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e60047] transition-colors shadow-md shadow-primary/20 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-fade-in">
                   <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                     Manage Addresses
                   </h3>
                   
                   {!isEditingAddress ? (
                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
                       {shippingAddress && shippingAddress.address ? (
                         <div>
                           <div className="flex justify-between items-start mb-6">
                             <div>
                               <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                 Default Shipping Address
                                 <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">Active</span>
                               </h4>
                               <p className="text-gray-500 text-sm mt-1">This address will be pre-filled at checkout.</p>
                             </div>
                             <button 
                               onClick={() => setIsEditingAddress(true)}
                               className="text-primary hover:text-white bg-red-50 hover:bg-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm border border-red-100"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                               Edit Address
                             </button>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                             <div>
                               <div className="mb-4">
                                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Contact Information</span>
                                 <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
                                 <p className="text-gray-600">{shippingAddress.emailAddress}</p>
                                 <p className="text-gray-600">{shippingAddress.phone1}</p>
                                 {shippingAddress.phone2 && <p className="text-gray-600">{shippingAddress.phone2}</p>}
                               </div>
                             </div>
                             <div>
                               <div>
                                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Shipping Destination</span>
                                 <p className="text-gray-900">{shippingAddress.address}</p>
                                 <p className="text-gray-900">{shippingAddress.city}, {shippingAddress.postalCode}</p>
                                 <p className="text-gray-900">{shippingAddress.country}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="text-center py-12">
                           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                             <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                           </div>
                           <h4 className="text-xl font-bold text-gray-900 mb-2">No Address Saved</h4>
                           <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't set up a default shipping address yet. Add one now to speed up your checkout process.</p>
                           <button 
                             onClick={() => setIsEditingAddress(true)}
                             className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e60047] transition-colors shadow-md shadow-primary/20 flex items-center gap-2 mx-auto"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                             Add New Address
                           </button>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-400"></div>
                       <div className="flex justify-between items-center mb-6">
                         <h4 className="font-bold text-gray-900 text-lg">
                           {shippingAddress?.address ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                         </h4>
                         <button 
                           onClick={() => setIsEditingAddress(false)}
                           className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                         </button>
                       </div>
                       
                       <form onSubmit={handleSaveAddress} className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                             <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="John Doe" />
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                             <input type="email" name="emailAddress" value={addressForm.emailAddress} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="john@example.com" />
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address *</label>
                             <input type="text" name="address" value={addressForm.address} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="123 Main Street, Apt 4B" />
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                             <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="New York" />
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Postal / Zip Code *</label>
                             <input type="text" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="10001" />
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country *</label>
                             <select name="country" value={addressForm.country} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800 appearance-none">
                               <option value="">Select a country</option>
                               <option value="Sri Lanka">Sri Lanka</option>
                               <option value="United States">United States</option>
                               <option value="United Kingdom">United Kingdom</option>
                               <option value="Australia">Australia</option>
                               <option value="Canada">Canada</option>
                             </select>
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Phone *</label>
                             <input type="tel" name="phone1" value={addressForm.phone1} onChange={handleAddressChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="+1 234 567 8900" />
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secondary Phone (Optional)</label>
                             <input type="tel" name="phone2" value={addressForm.phone2} onChange={handleAddressChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-gray-800" placeholder="+1 098 765 4321" />
                           </div>
                         </div>
                         
                         <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                           <button 
                             type="button" 
                             onClick={() => setIsEditingAddress(false)}
                             className="px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                           >
                             Cancel
                           </button>
                           <button 
                             type="submit" 
                             className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#e60047] transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                             Save Address
                           </button>
                         </div>
                       </form>
                     </div>
                   )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
