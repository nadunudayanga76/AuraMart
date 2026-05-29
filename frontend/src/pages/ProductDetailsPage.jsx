import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FiCheck, FiShield, FiGlobe, FiAward, FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle, FiX, FiMessageCircle } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RelatedProducts from '../components/RelatedProducts';
import { addToCart } from '../store/cartSlice';
import { addNotification } from '../store/notificationSlice';
import { toggleWishlistItem } from '../store/wishlistSlice';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for selections
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'info'
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setContactName(userInfo.name);
      setContactEmail(userInfo.email);
    }
  }, [userInfo]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedColor(data.variants[0].color || '');
        setSelectedImage(data.variants[0].image || data.image);
        if (data.variants[0].size) {
          setSelectedSize(data.variants[0].size);
        } else if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } else {
        setSelectedImage(data.image);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      }
    } catch (error) {
      console.error('Error fetching product', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Helper to get unique values
  const uniqueColors = product?.variants && product.variants.length > 0 
    ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] 
    : (product?.colors || []);

  const uniqueSizes = product?.variants && product.variants.length > 0
    ? [...new Set(product.variants.map(v => v.size).filter(Boolean))]
    : (product?.sizes || []);

  let currentStock = product?.countInStock || 0;
  if (product?.variants && product.variants.length > 0) {
    const matchedVariant = product.variants.find(v => 
      (selectedColor ? v.color === selectedColor : !v.color) && 
      (selectedSize ? v.size === selectedSize : !v.size)
    );
    currentStock = matchedVariant ? matchedVariant.countInStock : 0;
  }

  // Calculate dynamic prices
  const unitPrice = product ? (product.discountedPrice || product.price) : 0;
  const totalPrice = unitPrice * qty;
  const originalTotal = product?.originalPrice ? product.originalPrice * qty : 0;
  const savings = originalTotal > totalPrice ? originalTotal - totalPrice : 0;

  const isInWishlist = wishlistItems?.some(item => item._id === product?._id);

  const handleWishlistToggle = () => {
    if (!product) return;
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

  const handleAddToCart = () => {
    if (!product || currentStock === 0) return;

    setIsAddingToCart(true);

    const cartItem = {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: unitPrice,
      originalPrice: product.originalPrice || product.price,
      countInStock: currentStock,
      qty,
      brand: product.brand,
      category: product.category,
      selectedColor,
      selectedSize,
    };

    dispatch(addToCart(cartItem));
    dispatch(addNotification({
      type: 'info',
      title: 'Added to Cart',
      message: `${product.name} was added to your cart.`,
    }));

    // Show success toast
    setToastMessage(`${product.name} added to cart!`);
    setToastType('success');
    setShowToast(true);

    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      dispatch(addNotification({ type: 'error', title: 'Login Required', message: 'Please login to submit a review.' }));
      return;
    }
    setSubmittingReview(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}/reviews`, { rating, comment }, config);
      
      setToastMessage('Review submitted successfully!');
      setToastType('success');
      setShowToast(true);
      
      setRating(5);
      setComment('');
      setShowReviewForm(false);
      fetchProduct(); // Refresh product data to show new review
    } catch (error) {
      dispatch(addNotification({ 
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || error.message 
      }));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSendingContact(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}/contact`, {
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      setToastMessage('Message sent successfully! We will get back to you soon.');
      setToastType('success');
      setShowToast(true);
      setContactMessage('');
      setShowContactForm(false);
    } catch (error) {
      dispatch(addNotification({ 
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || error.message 
      }));
    } finally {
      setIsSendingContact(false);
    }
  };

  const handleBuyNow = () => {
    if (!product || currentStock === 0) return;

    const cartItem = {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: unitPrice,
      originalPrice: product.originalPrice || product.price,
      countInStock: currentStock,
      qty,
      brand: product.brand,
      category: product.category,
      selectedColor,
      selectedSize,
    };

    dispatch(addToCart(cartItem));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
           <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const allImagesArray = [
    product.image, 
    ...(product.images || []), 
    ...(product.variants?.map(v => v.image) || [])
  ].filter(Boolean);
  const allImages = [...new Set(allImagesArray)];

  const handleImageClick = (img) => {
    setSelectedImage(img);
    if (product?.variants && product.variants.length > 0) {
      const matchedVariant = product.variants.find(v => v.image === img);
      if (matchedVariant && matchedVariant.color) {
        setSelectedColor(matchedVariant.color);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Toast Notification */}
      <div 
        className={`fixed top-6 right-6 z-[9999] transition-all duration-500 ease-out ${
          showToast 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-[120%] opacity-0'
        }`}
      >
        <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border max-w-sm ${
          toastType === 'success' 
            ? 'bg-white border-green-200' 
            : 'bg-white border-blue-200'
        }`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            toastType === 'success' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <FiCheckCircle className={`${toastType === 'success' ? 'text-green-600' : 'text-blue-600'}`} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{toastMessage}</p>
            <Link 
              to="/cart" 
              className="text-xs font-bold text-primary hover:underline mt-1 inline-block"
            >
              View Cart →
            </Link>
          </div>
          <button 
            onClick={() => setShowToast(false)} 
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Top Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Images */}
            <div className="lg:col-span-5 flex flex-col gap-4">
               <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square border border-gray-100 flex items-center justify-center p-4">
                 <img src={selectedImage} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
               </div>
               {allImages.length > 1 && (
                 <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                   {allImages.map((img, index) => (
                     <div 
                       key={index} 
                       onClick={() => handleImageClick(img)}
                       className={`w-20 h-20 rounded-lg border-2 cursor-pointer overflow-hidden flex-shrink-0 bg-gray-50 ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                     >
                       <img src={img} alt={`${product.name} ${index}`} className="w-full h-full object-cover mix-blend-multiply" />
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Center: Details */}
            <div className="lg:col-span-4 flex flex-col">
               <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
               
               <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
                  <div className="flex items-center text-yellow-400">
                     {'★'.repeat(Math.floor(product.rating))}
                     {'☆'.repeat(5 - Math.floor(product.rating))}
                     <span className="text-orange-500 ml-1 font-bold">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <a href="#reviews" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                     <FiMessageCircle size={14}/> {product.numReviews} reviews
                  </a>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-600 flex items-center gap-1 font-medium">
                     <FiShoppingCart size={14}/> {product.orders || 0} orders
                  </span>
               </div>

               {currentStock > 0 ? (
                 <div className="flex items-center gap-1 text-green-600 font-medium text-sm mb-6">
                    <FiCheck /> In stock
                 </div>
               ) : (
                 <div className="text-red-500 font-medium text-sm mb-6">Out of stock</div>
               )}

               {product.features && product.features.length > 0 && (
                 <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mb-6 ml-1">
                   {product.features.map((feature, idx) => (
                     <li key={idx}>{feature}</li>
                   ))}
                 </ul>
               )}

               {((product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0)) && (
                 <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Color:</label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            if (product.variants && product.variants.length > 0) {
                              const matchedVariant = product.variants.find(v => v.color === color);
                              if (matchedVariant && matchedVariant.image) {
                                setSelectedImage(matchedVariant.image);
                              }
                              setQty(1);
                            }
                          }}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            selectedColor === color 
                              ? 'border-primary text-primary bg-primary/5' 
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                 </div>
               )}

               {uniqueSizes.length > 0 && (
                 <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Size:</label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map(size => {
                        // Check if this specific size is out of stock for the selected color
                        let isSizeOutOfStock = false;
                        if (product?.variants && product.variants.length > 0) {
                          const v = product.variants.find(v => 
                            (selectedColor ? v.color === selectedColor : true) && 
                            v.size === size
                          );
                          isSizeOutOfStock = v ? v.countInStock === 0 : true;
                        }

                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors cursor-pointer relative ${
                              selectedSize === size 
                                ? 'border-primary text-primary bg-primary/5' 
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                            } ${isSizeOutOfStock ? 'opacity-50 line-through text-gray-400 bg-gray-50 border-gray-200' : ''}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                 </div>
               )}
            </div>

            {/* Right: Pricing & Actions Box */}
            <div className="lg:col-span-3">
               <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 shadow-sm sticky top-24">
                  
                  {/* Dynamic Price Display */}
                  <div className="mb-2">
                     <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-gray-900">
                          LKR {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                     </div>
                     {product.originalPrice > unitPrice && (
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-sm text-gray-400 line-through">
                           LKR {originalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </span>
                         <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                           Save LKR {savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </span>
                       </div>
                     )}
                     <span className="text-[11px] text-gray-500 block mt-1">Price includes VAT</span>
                  </div>

                  {/* Unit price when qty > 1 */}
                  {qty > 1 && (
                    <div className="bg-white/70 rounded-lg px-3 py-2 mb-4 border border-gray-200/50">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Unit price</span>
                        <span className="font-medium text-gray-700">
                          LKR {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>Quantity</span>
                        <span className="font-medium text-gray-700">× {qty}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 my-1.5"></div>
                      <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                        <span>Total</span>
                        <span>LKR {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="flex border border-gray-300 rounded-lg w-max bg-white mb-5 overflow-hidden">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    ><FiMinus size={14} /></button>
                    <div className="px-4 py-2.5 text-sm font-bold border-x border-gray-300 min-w-[3rem] text-center select-none">{qty}</div>
                    <button 
                      onClick={() => setQty(Math.min(currentStock, qty + 1))}
                      disabled={qty >= currentStock}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    ><FiPlus size={14} /></button>
                  </div>

                  {/* Stock warning */}
                  {currentStock > 0 && currentStock <= 10 && (
                    <p className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1">
                      ⚡ Only {currentStock} left in stock!
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-6">
                     <button 
                        onClick={handleAddToCart}
                        disabled={currentStock === 0 || isAddingToCart}
                        className={`w-full bg-[#5A67D8] hover:bg-[#4C51BF] text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer ${
                          isAddingToCart ? 'scale-95' : 'hover:shadow-lg hover:shadow-indigo-500/25'
                        }`}
                     >
                       {isAddingToCart ? (
                         <>
                           <FiCheckCircle size={16} className="animate-bounce" /> Added!
                         </>
                       ) : (
                         <>
                           <FiShoppingCart size={16} /> Add to cart
                         </>
                       )}
                     </button>
                     <button 
                        onClick={handleBuyNow}
                        disabled={currentStock === 0}
                        className="w-full bg-[#EBF4FF] hover:bg-[#C3DAFE] text-[#5A67D8] font-medium py-3 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer hover:shadow-md"
                     >
                       Buy now
                     </button>
                     <button 
                       onClick={handleWishlistToggle}
                       className={`w-full font-medium py-3 rounded-md transition-colors text-sm border flex items-center justify-center gap-2 cursor-pointer ${
                         isInWishlist 
                           ? 'bg-red-50 hover:bg-red-100 text-primary border-red-200' 
                           : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                       }`}
                     >
                       <FiHeart size={14} fill={isInWishlist ? 'currentColor' : 'none'} className={isInWishlist ? 'text-primary' : ''} /> 
                       {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                     </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200 text-sm">
                     <div className="flex items-center gap-2 text-gray-700">
                        <FiGlobe className="text-blue-500" /> Worldwide shipping
                     </div>
                     <div className="flex items-center gap-2 text-gray-700">
                        <FiShield className="text-yellow-500" /> Secure payment
                     </div>
                     <div className="flex items-center gap-2 text-gray-700">
                        <FiAward className="text-orange-500" /> 2 years full warranty
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Detailed Information */}
           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed information</h3>
              
              <div className="text-gray-600 text-sm leading-relaxed space-y-4 mb-8 text-justify">
                {product.description.split('\n').map((para, i) => (
                   <p key={i}>{para}</p>
                ))}
              </div>

              {product.specifications && product.specifications.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-800 w-1/3 bg-gray-50/50">{spec.key}</td>
                          <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Shipping and Returns */}
              <div className="mt-10 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Shipping & Returns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FiGlobe size={20}/></div>
                         <h4 className="font-bold text-gray-800">Shipping Policy</h4>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-2 ml-1">
                         <li>• Processing time: 1-2 business days.</li>
                         <li>• Standard delivery: 3-5 business days.</li>
                         <li>• Free shipping on orders over LKR 10,000.</li>
                         <li>• Tracking information provided via email.</li>
                      </ul>
                   </div>
                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><FiShield size={20}/></div>
                         <h4 className="font-bold text-gray-800">Return Policy</h4>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-2 ml-1">
                         <li>• 30-day money-back guarantee.</li>
                         <li>• Items must be in original condition & packaging.</li>
                         <li>• Free return shipping for defective items.</li>
                         <li>• Refunds processed within 5-7 business days.</li>
                      </ul>
                   </div>
                </div>
              </div>

              {/* Contact Seller */}
              <div className="mt-10 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-gray-900">Have questions about this product?</h3>
                   {!showContactForm && (
                      <button 
                         onClick={() => setShowContactForm(true)}
                         className="text-primary hover:text-primary-dark font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                         Contact Support
                      </button>
                   )}
                </div>

                {showContactForm && (
                   <form onSubmit={handleContactSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input 
                               type="text" 
                               required
                               value={contactName}
                               onChange={(e) => setContactName(e.target.value)}
                               className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                               placeholder="John Doe"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                            <input 
                               type="email" 
                               required
                               value={contactEmail}
                               onChange={(e) => setContactEmail(e.target.value)}
                               className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                               placeholder="john@example.com"
                            />
                         </div>
                      </div>
                      <div className="mb-5">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                         <textarea 
                            rows="4" 
                            required
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder={`I'm interested in the ${product.name}. Could you tell me more about...`}
                            className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                         ></textarea>
                      </div>
                      <div className="flex gap-3">
                         <button 
                            type="submit" 
                            disabled={isSendingContact}
                            className="flex-1 bg-[#5A67D8] hover:bg-[#4C51BF] text-white font-medium py-3 rounded-md transition-colors text-sm disabled:opacity-50 cursor-pointer"
                         >
                            {isSendingContact ? 'Sending...' : 'Send Message'}
                         </button>
                         <button 
                            type="button" 
                            onClick={() => setShowContactForm(false)}
                            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-md transition-colors text-sm cursor-pointer border border-gray-200"
                         >
                            Cancel
                         </button>
                      </div>
                   </form>
                )}
              </div>
           </div>

           {/* Reviews */}
           <div className="lg:col-span-1" id="reviews">
              <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase text-sm tracking-wider">Reviews</h3>
              
              <div className="space-y-4 mb-6">
                 {product.reviews && product.reviews.length > 0 ? (
                   product.reviews.map(review => (
                     <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-3 mb-3">
                           <img src={`https://ui-avatars.com/api/?name=${review.name}&background=random`} alt={review.name} className="w-10 h-10 rounded-full" />
                           <div>
                              <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                              <div className="flex items-center gap-1 text-xs mt-0.5">
                                 <div className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                 <span className="text-gray-500 ml-1">{review.rating ? review.rating.toFixed(1) : '0.0'}</span>
                                 <span className="text-gray-400 mx-1">•</span>
                                 <span className="text-green-600 font-medium flex items-center gap-1">Verified buyer</span>
                              </div>
                           </div>
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          {review.comment}
                        </p>
                     </div>
                   ))
                 ) : (
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                      <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
                   </div>
                 )}
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-colors text-sm mb-4 cursor-pointer">
                  View all {product.numReviews} comments
                </button>
              )}

              {/* Write Review Section */}
              <div className="mt-6">
                 {!showReviewForm ? (
                    <button 
                       onClick={() => setShowReviewForm(true)}
                       className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-bold py-3 rounded-md transition-colors text-sm cursor-pointer"
                    >
                       Write a Review
                    </button>
                 ) : (
                    <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                       <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                       <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <select 
                             value={rating} 
                             onChange={(e) => setRating(e.target.value)}
                             className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          >
                             <option value="5">5 - Excellent</option>
                             <option value="4">4 - Very Good</option>
                             <option value="3">3 - Good</option>
                             <option value="2">2 - Fair</option>
                             <option value="1">1 - Poor</option>
                          </select>
                       </div>
                       <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                          <textarea 
                             rows="3" 
                             required
                             value={comment}
                             onChange={(e) => setComment(e.target.value)}
                             placeholder="What did you like or dislike?"
                             className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          ></textarea>
                       </div>
                       <div className="flex gap-3">
                          <button 
                             type="submit" 
                             disabled={submittingReview}
                             className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-md transition-colors text-sm disabled:opacity-50 cursor-pointer"
                          >
                             {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                          <button 
                             type="button" 
                             onClick={() => setShowReviewForm(false)}
                             className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-md transition-colors text-sm cursor-pointer"
                          >
                             Cancel
                          </button>
                       </div>
                    </form>
                 )}
              </div>
           </div>

         </div>

         {/* Related Products Section */}
         <RelatedProducts category={product.category} currentProductId={product._id} />

      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
