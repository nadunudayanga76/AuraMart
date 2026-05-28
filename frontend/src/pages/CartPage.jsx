import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiTrash2 } from 'react-icons/fi';
import { addToCart, removeFromCart } from '../store/cartSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=cart');
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return null;
  }

  const updateCartQty = (item, newQty) => {
    if (newQty < 1 || newQty > item.countInStock) return;
    dispatch(addToCart({ ...item, qty: newQty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center max-w-xl mx-auto">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-950 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition shadow-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                    <tr>
                      <th className="py-4 px-6 font-medium">Product</th>
                      <th className="py-4 px-6 font-medium">Price</th>
                      <th className="py-4 px-6 font-medium text-center">Quantity</th>
                      <th className="py-4 px-6 font-medium text-right">Subtotal</th>
                      <th className="py-4 px-6 font-medium text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.cartItemId || item._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <Link to={`/product/${item._id}`} className="font-semibold text-gray-900 hover:text-primary transition line-clamp-1">
                                {item.name}
                              </Link>
                              <div className="text-xs text-gray-500">
                                {item.brand} | {item.category}
                                {(item.selectedColor || item.selectedSize) && (
                                  <span className="block mt-0.5 text-primary font-medium">
                                    Variant: {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-950">LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center border border-gray-300 rounded w-24 mx-auto overflow-hidden">
                            <button 
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold transition"
                              onClick={() => updateCartQty(item, item.qty - 1)}
                              disabled={item.qty <= 1}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              value={item.qty} 
                              readOnly 
                              className="w-8 text-center text-sm font-semibold focus:outline-none bg-transparent" 
                            />
                            <button 
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold transition"
                              onClick={() => updateCartQty(item, item.qty + 1)}
                              disabled={item.qty >= item.countInStock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-950 text-right">
                          LKR {(item.price * item.qty).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            className="text-red-400 hover:text-red-600 transition p-2 bg-red-50 hover:bg-red-100 rounded-full"
                            onClick={() => removeFromCartHandler(item.cartItemId || item._id)}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-full lg:w-96">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-950 mb-6">Cart Totals</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-100">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-950">LKR {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-100">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-950 font-bold text-xl pt-2">
                    <span>Total</span>
                    <span className="text-primary">LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block w-full bg-primary text-white text-center py-3.5 rounded-full font-bold hover:bg-red-600 transition shadow-md hover:shadow-lg">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
