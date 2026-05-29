import React, { useState, useEffect } from 'react';
import { FiHeart, FiShoppingCart, FiCheckCircle, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../store/cartSlice';
import { addNotification } from '../store/notificationSlice';
import { toggleWishlistItem } from '../store/wishlistSlice';

const ProductCard = ({ product, isTrending = false }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [showToast, setShowToast] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInWishlist = wishlistItems?.some(item => item._id === product._id);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    dispatch(addToCart({ ...product, qty: 1 }));
    dispatch(addNotification({
      type: 'info',
      title: 'Added to Cart',
      message: `${product.name} was added to your cart.`,
    }));
    setShowToast(true);
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!userInfo) {
      dispatch(addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please login to add items to your wishlist.',
      }));
      return;
    }
    dispatch(toggleWishlistItem(product._id));
    if (!isInWishlist) {
      dispatch(addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.name} was saved.`,
      }));
    }
  };

  return (
    <>
    {/* Local Toast Notification for Product Card */}
    <div 
      className={`fixed top-6 right-6 z-[9999] transition-all duration-500 ease-out ${
        showToast ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 p-4 rounded-xl shadow-2xl border max-w-sm bg-white border-green-200">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
          <FiCheckCircle className="text-green-600" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{product.name} added to cart!</p>
          <Link to="/cart" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">
            View Cart →
          </Link>
        </div>
        <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 cursor-pointer">
          <FiX size={16} />
        </button>
      </div>
    </div>

    <div className="bg-white border-2 border-transparent hover:border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full rounded-xl overflow-hidden">
      <div className="relative p-6 pb-0 bg-white flex-shrink-0">
        {/* Discount / Flash Sale Badge */}
        {product.flashSaleEndDate && new Date(product.flashSaleEndDate) > new Date() ? (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-wider z-10 rounded-sm flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.4)]">
            ⚡ FLASH
          </div>
        ) : product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-wider z-10 rounded-sm">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 z-10 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isInWishlist ? 'bg-primary/10 text-primary' : 'bg-white/50 text-gray-400 hover:text-primary hover:bg-white/80'
          }`}
        >
          <FiHeart 
            size={18} 
            strokeWidth={2} 
            fill={isInWishlist ? "currentColor" : "none"} 
            className={`transition-transform ${isInWishlist ? 'scale-110' : 'scale-100'}`}
          />
        </button>

        <Link to={`/product/${product._id}`} className="block h-36 md:h-48 sm:h-56 relative flex items-center justify-center">
          <img 
            src={product.image || "https://placehold.co/400x400/f8f9fa/cccccc?text=Product"} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-grow">
        {isTrending && (
           <div className="mb-2">
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
               <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
               Trending
             </span>
           </div>
        )}
        <Link to={`/product/${product._id}`}>
          <h4 className="font-bold text-gray-900 mb-2 truncate group-hover:text-primary transition cursor-pointer text-xs md:text-[15px]">
            {product.name}
          </h4>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          {/* Simple Rating Stars */}
          <div className="flex text-[#ffb800] text-[13px] gap-[1px]">
            <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-gray-300">★</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">({product.numReviews})</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              {product.originalPrice > product.price ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-[15px] sm:text-base font-black text-gray-900 leading-tight">LKR {product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium line-through mt-0.5 decoration-gray-300">LKR {product.originalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </>
              ) : (
                <span className="text-sm md:text-[15px] sm:text-base font-black text-gray-900 leading-tight">LKR {product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                isAddingToCart 
                  ? 'bg-green-50 border-green-500 text-green-600 scale-95' 
                  : 'bg-white border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
              }`}
            >
              {isAddingToCart ? <FiCheckCircle size={16} strokeWidth={2.5} className="animate-bounce" /> : <FiShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductCard;
